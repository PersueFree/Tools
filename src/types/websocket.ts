/** WebSocket 配置项 */
export interface WsConfig {
  url: string;
  port?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  heartbeatMsg?: string;
  maxReconnectAttempts?: number;
}

/** 聊天消息类型 */
export type WsMessageType = 'chat' | 'system';

/** 跨端通信消息体 */
export interface WsMessage {
  id: string;
  from: string;
  content: string;
  timestamp: number;
  type?: WsMessageType;
}

/** 连接状态 */
export type WsConnectionState =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

/** WebSocket 关闭事件 */
export interface WsCloseEvent {
  code: number;
  reason: string;
  wasClean?: boolean;
}

/** WebSocket 事件映射 */
export interface WsEventMap {
  message: WsMessage;
  open: null;
  close: WsCloseEvent;
  error: Event;
  stateChange: WsConnectionState;
}

/** WebSocket 事件类型 */
export type WsEventType = keyof WsEventMap;

/** WebSocket 事件回调 */
export type WsCallback<T extends WsEventType> = (data: WsEventMap[T]) => void;
