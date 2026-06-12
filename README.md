# Tools

## WebSocket 聊天室本地服务

聊天室页面依赖本地 WebSocket 服务，服务端代码位于 `nodeConfig/server.js`，默认监听 `9423` 端口。

### 环境变量

项目根目录提供了示例文件 [`.env.example`](/Users/lixiang/Desktop/lixiang/TypeScript/Project_Tools/Tools/.env.example)，可以复制为 `.env` 后按需调整：

```bash
WS_PORT=9423
VITE_WS_PORT=9423
# VITE_WS_URL=ws://127.0.0.1:9423
```

说明：

- `WS_PORT` 控制本地 WebSocket 服务端口。
- `VITE_WS_PORT` 控制前端默认拼接的端口。
- `VITE_WS_URL` 用于强制覆盖完整连接地址，优先级高于自动拼接逻辑。

### 启动方式

在项目根目录执行：

```bash
npm run ws:start
```

也可以使用等价别名：

```bash
npm run chat:start
```

如果想一条命令同时启动前端和聊天室服务，可以执行：

```bash
npm run dev:chat
```

如果你想单独进入服务目录运行，也可以执行：

```bash
cd nodeConfig
npm start
```

### 前端连接地址

前端默认会自动连接当前页面所在主机的 `VITE_WS_PORT` 端口，例如本机访问时通常等价于：

```bash
VITE_WS_URL=ws://127.0.0.1:9423
```

如果需要连接其他机器或端口，可以在前端环境变量里覆盖 `VITE_WS_URL`，例如：

```bash
VITE_WS_URL=ws://192.168.1.23:9423
```
