/**
 * Prompt 优化器 Agent
 * 用户输入原始描述 → AI 输出摄影级英文 Prompt（纯文本，包含全部相机参数）
 */

import { chat } from "../services/aiClient.js";
import { PROMPT_OPTIMIZER } from "../prompts/photography.js";

/**
 * @param {string} rawPrompt - 用户原始描述
 * @param {string} [provider="zhipu"]
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function optimizePrompt(rawPrompt, provider = "zhipu") {
  const fullPrompt = `${PROMPT_OPTIMIZER}\n\n用户输入：${rawPrompt}`;

  const raw = await chat(provider, fullPrompt, null, {
    temperature: 0.5,     // 降低随机性，保证输出稳定
    maxTokens: 800,
  });

  // 清理可能残留的代码块标记和首尾空白
  const optimized = raw
    .replace(/```[\w]*\n?/g, "")
    .replace(/```/g, "")
    .trim();

  console.log(`[Optimize] 输出长度: ${optimized.length}`);

  return {
    success: true,
    data: {
      original: rawPrompt,
      optimized,
    },
  };
}
