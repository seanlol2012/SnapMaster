/**
 * 摄影教练 Agent 模块
 * 编排图片处理 → 提示词构建 → AI 调用的完整流程
 */

import { chat } from "../services/aiClient.js";
import { imageToDataUrl } from "../utils/image.js";
import { COACH_PROMPT } from "../prompts/photography.js";

/**
 * 摄影教练：分析照片并给出构图与拍摄指导
 * @param {string} imagePath - 本地图片路径
 * @param {string} [provider="zhipu"] - AI 提供商
 * @returns {Promise<{ result: string, provider: string, imagePath: string }>}
 */
export async function analyzePhoto(imagePath, provider = "zhipu") {
  console.log(`📸 [SnapMaster] 正在使用 ${provider} 分析照片构图...`);

  // 1. 图片转 data URL
  const imageDataUrl = imageToDataUrl(imagePath);

  // 2. 调用 AI 模型
  const result = await chat(provider, COACH_PROMPT, imageDataUrl, {
    temperature: 0.8,
    maxTokens: 600,
  });

  return {
    result,
    provider,
    imagePath,
  };
}

/**
 * 格式化输出结果
 * @param {{ result: string, provider: string, imagePath: string }} data
 */
export function printResult({ result, provider, imagePath }) {
  console.log("\n================ 摄影分析报告 ================\n");
  console.log(`📷 分析照片: ${imagePath}`);
  console.log(`🤖 使用模型: ${provider}\n`);
  console.log(result);
  console.log("\n===================================================\n");
}
