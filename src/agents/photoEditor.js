/**
 * 照片编辑 Agent
 * 上传照片 + 修改指令 → AI 生成修改后的图片
 */

import { chat } from "../services/aiClient.js";
import { generateImage } from "../services/imageGen.js";
import { bufferToDataUrl, getImageSize } from "../utils/buffer.js";
import { EDIT_TRANSLATE_PROMPT } from "../prompts/photography.js";

/**
 * 根据原始尺寸计算匹配的生成尺寸（保持比例）
 * 智谱要求：512-2880px，16 的整数倍，总像素 ≤ 2^21(2097152)
 * @param {number} w - 原图宽
 * @param {number} h - 原图高
 * @returns {string} "WxH" 格式
 */
function calcGenSize(w, h) {
  const ratio = w / h;
  const min = 512, max = 2880, maxPx = 2097152;

  // 按最大像素数反算理想宽高
  let gw, gh;
  if (ratio >= 1) {
    gw = Math.floor(Math.sqrt(maxPx * ratio));
    gh = Math.floor(gw / ratio);
  } else {
    gh = Math.floor(Math.sqrt(maxPx / ratio));
    gw = Math.floor(gh * ratio);
  }

  // 对齐到 16 的整数倍，并钳制范围
  gw = Math.max(min, Math.min(max, Math.floor(gw / 16) * 16));
  gh = Math.max(min, Math.min(max, Math.floor(gh / 16) * 16));

  return `${gw}x${gh}`;
}

/**
 * @param {{ buffer: Buffer, mimetype: string }} image
 * @param {string} instruction - 用户的修改指令
 * @param {string} [provider="zhipu"]
 * @returns {Promise<{success: boolean, data: object}>}
 */
export async function editPhoto(image, instruction, provider = "zhipu") {
  // 1. 用视觉模型分析原图 + 翻译编辑指令为生图 Prompt
  const dataUrl = bufferToDataUrl(image.buffer, image.mimetype);
  const fullPrompt = `${EDIT_TRANSLATE_PROMPT}\n\n用户的修改指令：${instruction}`;

  const raw = await chat(provider, fullPrompt, dataUrl, {
    temperature: 0.7,
    maxTokens: 1000,
  });

  // 2. 解析 JSON
  let parsed;
  try {
    const jsonStr = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    parsed = { description: raw, editPrompt: "", suggestion: "" };
  }

  // 3. 调用生图 API（按原图比例生成）
  let generated;
  let genError = null;
  try {
    const { width, height } = getImageSize(image.buffer);
    const size = calcGenSize(width, height);
    console.log(`[Edit] 原图 ${width}x${height} (${(width/height).toFixed(2)}:1) → 生成尺寸 ${size}`);
    generated = await generateImage(parsed.editPrompt, provider, { size });
  } catch (e) {
    genError = e.message;
  }

  return {
    success: true,
    data: {
      description: parsed.description || "图片分析完成",
      editPrompt: parsed.editPrompt || "",
      suggestion: parsed.suggestion || "已根据您的指令生成编辑方案",
      generatedImage: generated?.url || null,
      revisedPrompt: generated?.revisedPrompt || null,
      genError,
    },
  };
}
