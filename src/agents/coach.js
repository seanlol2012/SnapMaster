/**
 * 摄影教练 Agent
 * 上传照片 → AI 给出构图诊断 + 拍摄参数指导
 */

import { chat } from "../services/aiClient.js";
import { bufferToDataUrl } from "../utils/buffer.js";
import { COACH_PROMPT } from "../prompts/photography.js";

/**
 * @param {{ buffer: Buffer, mimetype: string }} image
 * @param {string} [provider="zhipu"]
 * @returns {Promise<{success: boolean, data: string}>}
 */
export async function coachPhoto(image, provider = "zhipu") {
  const dataUrl = bufferToDataUrl(image.buffer, image.mimetype);
  const result = await chat(provider, COACH_PROMPT, dataUrl, {
    temperature: 0.8,
    maxTokens: 1500,
  });

  return { success: true, data: result };
}
