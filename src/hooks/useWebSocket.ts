import { useCallback, useEffect, useState } from 'react';
import { getWsClient } from '@/utils/websocketClient';
import type { WsCloseEvent, WsConnectionState, WsMessage } from '@/types/websocket';

const wsClient = getWsClient();

const createSenderId = () => {
  const saved = window.localStorage.getItem('chat_user_name');
  if (saved) {
    return saved;
  }

  const generated = `设备_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  window.localStorage.setItem('chat_user_name', generated);
  return generated;
};

const createMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const useWebSocket = () => {
  const [msgList, setMsgList] = useState<WsMessage[]>([]);
  const [connectionState, setConnectionState] = useState<WsConnectionState>(wsClient.state);
  const [lastCloseEvent, setLastCloseEvent] = useState<WsCloseEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleMessage = useCallback((msg: WsMessage) => {
    setMsgList((prev) => {
      if (prev.some((item) => item.id === msg.id)) {
        return prev;
      }

      return [...prev, msg];
    });
  }, []);

  const handleOpen = useCallback(() => {
    setErrorMessage('');
    setLastCloseEvent(null);
  }, []);

  const handleClose = useCallback((event: WsCloseEvent) => {
    setLastCloseEvent(event);
  }, []);

  const handleError = useCallback(() => {
    setErrorMessage('连接出现异常，聊天室会自动尝试重连。');
  }, []);

  const handleStateChange = useCallback((state: WsConnectionState) => {
    setConnectionState(state);
  }, []);

  useEffect(() => {
    wsClient.connect();
    wsClient.on('message', handleMessage);
    wsClient.on('open', handleOpen);
    wsClient.on('close', handleClose);
    wsClient.on('error', handleError);
    wsClient.on('stateChange', handleStateChange);

    return () => {
      wsClient.off('message', handleMessage);
      wsClient.off('open', handleOpen);
      wsClient.off('close', handleClose);
      wsClient.off('error', handleError);
      wsClient.off('stateChange', handleStateChange);
    };
  }, [handleClose, handleError, handleMessage, handleOpen, handleStateChange]);

  const sendMsg = useCallback((content: string, from?: string) => {
    const normalizedContent = content.trim();
    if (!normalizedContent) {
      return false;
    }

    const sender = from?.trim() || createSenderId();
    const msg: WsMessage = {
      id: createMessageId(),
      from: sender,
      content: normalizedContent,
      timestamp: Date.now(),
      type: 'chat',
    };

    return wsClient.send(msg);
  }, []);

  const closeWs = useCallback(() => {
    wsClient.close();
  }, []);

  const reconnect = useCallback(() => {
    wsClient.connect();
  }, []);

  const clearMessages = useCallback(() => {
    setMsgList([]);
  }, []);

  return {
    msgList,
    sendMsg,
    closeWs,
    reconnect,
    clearMessages,
    connectionState,
    isConnected: connectionState === 'connected',
    wsUrl: wsClient.url,
    errorMessage,
    lastCloseEvent,
  };
};
