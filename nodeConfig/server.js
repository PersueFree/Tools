/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: require('node:path').resolve(__dirname, '../.env') });

const WebSocket = require('ws');

const PORT = Number(process.env.WS_PORT || 9423);
const HEARTBEAT_MESSAGE = 'ping';
const wss = new WebSocket.Server({ port: PORT });

const createMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

wss.on('listening', () => {
  console.log(`WebSocket 服务已启动，端口：${PORT}`);
});

wss.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`WebSocket 服务启动失败：端口 ${PORT} 已被占用。`);
    process.exit(1);
    return;
  }

  console.error('WebSocket 服务异常：', error);
  process.exit(1);
});

const normalizeMessage = (raw) => {
  if (!raw || raw === HEARTBEAT_MESSAGE) {
    return null;
  }

  try {
    const data = JSON.parse(raw);

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
    console.error('消息解析失败：', error);
    return null;
  }
};

const broadcast = (payload) => {
  const serializedPayload = JSON.stringify(payload);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serializedPayload);
    }
  });
};

wss.on('connection', (ws, request) => {
  const clientAddress = request.socket.remoteAddress || 'unknown';
  console.log(`新客户端已连接：${clientAddress}`);

  ws.on('message', (buffer) => {
    const rawMessage = buffer.toString();
    const normalizedMessage = normalizeMessage(rawMessage);

    if (!normalizedMessage) {
      return;
    }

    console.log('收到客户端消息：', normalizedMessage);
    broadcast(normalizedMessage);
  });

  ws.on('close', () => {
    console.log(`客户端已断开连接：${clientAddress}`);
  });

  ws.on('error', (error) => {
    console.error(`连接错误（${clientAddress}）：`, error);
  });
});
