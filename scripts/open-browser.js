/**
 * 自动打开浏览器脚本
 * 等待服务就绪后打开 http://localhost:3000
 */

import { exec } from 'child_process';

const URL = 'http://localhost:3000';
const DELAY = 3000; // 等 3 秒让 Next.js 编译完成

setTimeout(() => {
  const platform = process.platform;
  const cmd = platform === 'win32'
    ? `start "" "${URL}"`
    : platform === 'darwin'
      ? `open "${URL}"`
      : `xdg-open "${URL}"`;

  exec(cmd, (err) => {
    if (err) console.log(`请手动访问: ${URL}`);
  });
}, DELAY);
