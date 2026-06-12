import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { WsConnectionState, WsMessage } from '@/types/websocket';

const CHAT_USERNAME_KEY = 'chat_user_name';

const createDefaultUserName = () => `设备_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

const getStatusText = (state: WsConnectionState) => {
  switch (state) {
    case 'connected':
      return '已连接，可实时收发消息';
    case 'connecting':
      return '连接中，正在建立聊天室连接';
    case 'reconnecting':
      return '连接断开，正在自动重连';
    case 'error':
      return '连接异常，等待恢复';
    default:
      return '连接已关闭';
  }
};

const MsgContainer = styled.div`
  width: min(680px, calc(100vw - 32px));
  margin: 20px auto;
  padding: 20px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
`;

const TitleGroup = styled.div`
  h2 {
    margin: 0 0 6px;
    color: #0f172a;
    font-size: 22px;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
  }
`;

const StatusBadge = styled.div<{ $state: WsConnectionState }>`
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $state }) => ($state === 'connected' ? '#047857' : '#9a3412')};
  background: ${({ $state }) => ($state === 'connected' ? '#d1fae5' : '#ffedd5')};
`;

const Toolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }
`;

const InlineActions = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ $variant?: 'secondary' }>`
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.2s ease;
  color: ${({ $variant }) => ($variant === 'secondary' ? '#0f172a' : '#ffffff')};
  background: ${({ $variant }) => ($variant === 'secondary' ? '#e2e8f0' : '#2563eb')};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:not(:disabled):active {
    transform: translateY(1px);
  }
`;

const ErrorBar = styled.div`
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 13px;
`;

const MsgListWrapper = styled.div`
  height: 420px;
  padding: 14px;
  overflow-y: auto;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 30%),
    #ffffff;
`;

const EmptyMsgTip = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 14px;
`;

const MsgItem = styled.div<{ $isSelf: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ $isSelf }) => ($isSelf ? 'flex-end' : 'flex-start')};
  margin: 10px 0;

  .msg-meta {
    margin-bottom: 4px;
    color: #64748b;
    font-size: 12px;
  }

  .msg-content {
    max-width: min(82%, 420px);
    padding: 10px 12px;
    border-radius: 14px;
    line-height: 1.5;
    font-size: 14px;
    color: #0f172a;
    background: ${({ $isSelf }) => ($isSelf ? '#dbeafe' : '#f1f5f9')};
    word-break: break-word;
  }
`;

const Composer = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.textarea`
  min-height: 82px;
  resize: vertical;
  padding: 12px;
  border: 1px solid #dbe2ea;
  border-radius: 14px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
  }

  &:disabled {
    background: #f8fafc;
  }
`;

const ComposerSide = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
`;

const ConnectionMeta = styled.div`
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 12px;
  word-break: break-all;
`;

const DataTransmission = () => {
  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const msgBoxRef = useRef<HTMLDivElement>(null);
  const {
    msgList,
    isConnected,
    sendMsg,
    reconnect,
    clearMessages,
    connectionState,
    wsUrl,
    errorMessage,
    lastCloseEvent,
  } = useWebSocket();

  useEffect(() => {
    const savedName = window.localStorage.getItem(CHAT_USERNAME_KEY) || createDefaultUserName();
    window.localStorage.setItem(CHAT_USERNAME_KEY, savedName);
    setUserName(savedName);
  }, []);

  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
    }
  }, [msgList]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim() || !userName.trim()) {
      return;
    }

    const success = sendMsg(inputValue, userName);
    if (success) {
      setInputValue('');
      return;
    }

    window.alert('消息发送失败，请确认服务端已启动并等待重连完成。');
  }, [inputValue, sendMsg, userName]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleUserNameChange = useCallback((value: string) => {
    setUserName(value);
    window.localStorage.setItem(CHAT_USERNAME_KEY, value);
  }, []);

  return (
    <MsgContainer>
      <Header>
        <TitleGroup>
          <h2>WebSocket 聊天室</h2>
          <p>支持跨设备广播、断线重连和本地昵称记忆。</p>
        </TitleGroup>
        <StatusBadge $state={connectionState}>{getStatusText(connectionState)}</StatusBadge>
      </Header>

      <Toolbar>
        <Input
          value={userName}
          onChange={(event) => handleUserNameChange(event.target.value)}
          placeholder="设置你的昵称"
          maxLength={24}
        />
        <InlineActions>
          <Button type="button" onClick={reconnect} $variant="secondary">
            重连
          </Button>
          <Button type="button" onClick={clearMessages} $variant="secondary">
            清空记录
          </Button>
        </InlineActions>
      </Toolbar>

      {errorMessage ? <ErrorBar>{errorMessage}</ErrorBar> : null}
      {!isConnected && lastCloseEvent?.reason ? (
        <ErrorBar>最近一次断开原因：{lastCloseEvent.reason || `code ${lastCloseEvent.code}`}</ErrorBar>
      ) : null}
      <ConnectionMeta>当前连接地址：{wsUrl}</ConnectionMeta>

      <MsgListWrapper ref={msgBoxRef}>
        {msgList.length === 0 ? (
          <EmptyMsgTip>聊天室已经准备好了，发一条消息试试看。</EmptyMsgTip>
        ) : (
          msgList.map((msg: WsMessage) => {
            const isSelf = msg.from === userName;
            return (
              <MsgItem key={msg.id} $isSelf={isSelf}>
                <div className="msg-meta">
                  {msg.from} · {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div className="msg-content">{msg.content}</div>
              </MsgItem>
            );
          })
        )}
      </MsgListWrapper>

      <Composer>
        <TextArea
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ? '输入消息，按 Enter 发送，Shift + Enter 换行' : '等待聊天室连接恢复后再发送'}
          disabled={!isConnected}
        />
        <ComposerSide>
          <div>
            当前状态：{getStatusText(connectionState)}
            <br />
            {isConnected ? '可以开始聊天了' : '服务端未就绪时会自动重连'}
          </div>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!isConnected || !inputValue.trim() || !userName.trim()}
          >
            发送消息
          </Button>
        </ComposerSide>
      </Composer>
    </MsgContainer>
  );
};

export default DataTransmission;
