import type {
  WsCallback,
  WsConfig,
  WsConnectionState,
  WsEventMap,
  WsEventType,
  WsMessage,
} from '@/types/websocket';

const DEFAULT_WS_PORT = Number(import.meta.env.VITE_WS_PORT || 9423);

const getDefaultWsUrl = () => {
  if (typeof window === 'undefined') {
    return `ws://127.0.0.1:${DEFAULT_WS_PORT}`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const hostname = window.location.hostname || '127.0.0.1';
  return `${protocol}://${hostname}:${DEFAULT_WS_PORT}`;
};

const DEFAULT_CONFIG: Required<WsConfig> = {
  url: import.meta.env.VITE_WS_URL || getDefaultWsUrl(),
  port: DEFAULT_WS_PORT,
  reconnectInterval: 3000,
  heartbeatInterval: 10000,
  heartbeatMsg: 'ping',
  maxReconnectAttempts: Infinity,
};

const createMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

class WebSocketClient {
  private static instance: WebSocketClient | null = null;

  private ws: WebSocket | null = null;
  private config: Required<WsConfig>;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private manualClose = false;
  private connectionState: WsConnectionState = 'disconnected';
  private callbacks: { [K in WsEventType]: Set<WsCallback<K>> } = {
    message: new Set(),
    open: new Set(),
    close: new Set(),
    error: new Set(),
    stateChange: new Set(),
  };

  private constructor(config: Partial<WsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.connect();
  }

  public static getInstance(config?: Partial<WsConfig>): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient(config);
    } else if (config) {
      WebSocketClient.instance.updateConfig(config);
    }

    return WebSocketClient.instance;
  }

  public connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.manualClose = false;
    this.clearReconnectTimer();
    this.setConnectionState(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      this.ws = new WebSocket(this.config.url);
      this.bindSocketEvents();
    } catch (error) {
      console.error('创建 WebSocket 失败：', error);
      this.scheduleReconnect();
    }
  }

  public send(msg: WsMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket 未连接，无法发送消息');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(msg));
      return true;
    } catch (error) {
      console.error('发送消息失败：', error);
      return false;
    }
  }

  public on<T extends WsEventType>(type: T, callback: WsCallback<T>): void {
    this.callbacks[type].add(callback);
  }

  public off<T extends WsEventType>(type: T, callback?: WsCallback<T>): void {
    if (!callback) {
      this.callbacks[type].clear();
      return;
    }

    this.callbacks[type].delete(callback);
  }

  public close(): void {
    this.manualClose = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();

    if (!this.ws) {
      this.setConnectionState('disconnected');
      return;
    }

    const activeSocket = this.ws;
    this.ws = null;
    activeSocket.close(1000, 'manual close');
  }

  public get isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  public get state(): WsConnectionState {
    return this.connectionState;
  }

  public get url(): string {
    return this.config.url;
  }

  private updateConfig(config: Partial<WsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private bindSocketEvents(): void {
    if (!this.ws) {
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.setConnectionState('connected');
      this.emit('open', null);
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      const parsedMessage = this.parseMessage(event.data);

      if (!parsedMessage) {
        return;
      }

      this.emit('message', parsedMessage);
    };

    this.ws.onerror = (event: Event) => {
      console.error('WebSocket 连接错误：', event);
      if (this.connectionState !== 'connected') {
        this.setConnectionState('error');
      }
      this.emit('error', event);
    };

    this.ws.onclose = (event: CloseEvent) => {
      this.stopHeartbeat();
      this.ws = null;

      this.emit('close', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
      });

      if (this.manualClose || event.code === 1000) {
        this.setConnectionState('disconnected');
        return;
      }

      this.scheduleReconnect();
    };
  }

  private parseMessage(rawData: string): WsMessage | null {
    if (rawData === this.config.heartbeatMsg) {
      return null;
    }

    try {
      const data = JSON.parse(rawData) as {
        id?: string;
        from?: string;
        content?: string;
        timestamp?: number;
        type?: string;
      };

      if (data.type === 'heartbeat') {
        return null;
      }

      if (!data.content || !data.from) {
        return null;
      }

      return {
        id: data.id || createMessageId(),
        from: data.from,
        content: data.content,
        timestamp: typeof data.timestamp === 'number' ? data.timestamp : Date.now(),
        type: data.type === 'system' ? 'system' : 'chat',
      };
    } catch (error) {
      console.error('WS 消息解析失败：', error);
      return null;
    }
  }

  private scheduleReconnect(): void {
    if (this.manualClose) {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setConnectionState('disconnected');
      return;
    }

    this.reconnectAttempts += 1;
    this.setConnectionState('reconnecting');
    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.config.reconnectInterval);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(this.config.heartbeatMsg);
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (!this.heartbeatTimer) {
      return;
    }

    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private setConnectionState(state: WsConnectionState): void {
    this.connectionState = state;
    this.emit('stateChange', state);
  }

  private emit<T extends WsEventType>(type: T, payload: WsEventMap[T]): void {
    this.callbacks[type].forEach((callback) => {
      callback(payload);
    });
  }
}

export const getWsClient = (config?: Partial<WsConfig>) => WebSocketClient.getInstance(config);
