const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log('用法: npm run dev:chat');
  console.log('说明: 同时启动 Vite 前端和本地 WebSocket 聊天服务。');
  process.exit(0);
}

const childProcesses = [];
let isShuttingDown = false;
const wsPort = Number(process.env.WS_PORT || 9423);
const viteCliPath = path.resolve(__dirname, '../node_modules/vite/bin/vite.js');
const wsServerPath = path.resolve(__dirname, '../nodeConfig/server.js');

const isPortInUse = (port) =>
  new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          resolve(true);
          return;
        }

        reject(error);
      })
      .once('listening', () => {
        tester.close(() => resolve(false));
      })
      .listen(port);
  });

const spawnTask = (name, command, commandArgs) => {
  const child = spawn(command, commandArgs, {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (isShuttingDown) {
      return;
    }

    if (code === 0) {
      console.log(`[${name}] 已退出`);
      shutdown(0);
      return;
    }

    console.error(`[${name}] 异常退出`, { code, signal });
    shutdown(typeof code === 'number' ? code : 1);
  });

  child.on('error', (error) => {
    console.error(`[${name}] 启动失败`, error);
    shutdown(1);
  });

  childProcesses.push(child);
};

const shutdown = (exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  childProcesses.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });

  setTimeout(() => {
    process.exit(exitCode);
  }, 100);
};

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('正在同时启动 Vite 和 WebSocket 聊天服务...');

const main = async () => {
  try {
    const wsPortOccupied = await isPortInUse(wsPort);

    if (wsPortOccupied) {
      console.log(`[ws] 检测到端口 ${wsPort} 已被占用，跳过重复启动，复用现有 WebSocket 服务。`);
    } else {
      spawnTask('ws', process.execPath, [wsServerPath]);
    }
  } catch (error) {
    console.error('[ws] 启动前端口检查失败', error);
    shutdown(1);
    return;
  }

  spawnTask('vite', process.execPath, [viteCliPath]);
};

main();
