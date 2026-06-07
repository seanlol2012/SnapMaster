/**
 * SnapMaster - 摄影助手 AI 教练
 * 入口文件：负责启动参数解析与 Agent 调度
 */

import "dotenv/config";
import { analyzePhoto, printResult } from "./agents/photographyCoach.js";
import { listProviders } from "./config/providers.js";

async function main() {
  // 从命令行参数或环境变量读取配置
  const args = process.argv.slice(2);
  const imagePath = args[0] || process.env.DEFAULT_IMAGE || "./test.jpg";
  const provider = args[1] || process.env.AI_PROVIDER || "zhipu";

  // 帮助信息
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
📸 SnapMaster - 摄影助手 AI 教练

用法:
  node src/index.js <图片路径> [AI提供商]

示例:
  node src/index.js ./photo.jpg zhipu
  node src/index.js ./photo.jpg deepseek

可用提供商: ${listProviders().join(", ")}

环境变量:
  AI_PROVIDER     - 默认 AI 提供商
  DEFAULT_IMAGE   - 默认分析图片路径
  ZHIPU_API_KEY   - 智谱 API Key
  DEEPSEEK_API_KEY- DeepSeek API Key
    `);
    return;
  }

  try {
    const data = await analyzePhoto(imagePath, provider);
    printResult(data);
  } catch (error) {
    console.error("❌ 运行出错:", error.message);
    process.exit(1);
  }
}

main();
