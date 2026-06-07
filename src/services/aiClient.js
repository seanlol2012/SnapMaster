/**
 * AI 客户端服务模块
 * 封装 OpenAI 兼容的 API 调用逻辑，所有供应商通用
 */

import OpenAI from "openai";
import { getProviderConfig } from "../config/providers.js";

/**
 * 创建 OpenAI 兼容客户端实例
 * @param {string} provider - 提供商名称
 * @returns {{ client: OpenAI, config: object }}
 */
export function createClient(provider = "zhipu") {
  const config = getProviderConfig(provider);

  const client = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  return { client, config };
}

/**
 * 检查当前提供商是否支持视觉（图片输入）
 */
export function supportsVision(provider = "zhipu") {
  const config = getProviderConfig(provider);
  return config.features.includes("vision");
}

/**
 * 构建多模态消息（文本 + 图片）
 * @param {string} textPrompt - 文本提示词
 * @param {string} imageDataUrl - data URL 格式的图片
 * @returns {Array} 消息内容数组
 */
export function buildMultimodalMessage(textPrompt, imageDataUrl) {
  return [
    { type: "text", text: textPrompt },
    {
      type: "image_url",
      image_url: { url: imageDataUrl },
    },
  ];
}

/**
 * 调用 AI 模型进行对话
 * 自动判断是纯文本还是多模态（视觉）调用
 *
 * @param {string} provider - 提供商
 * @param {string} prompt - 提示词
 * @param {string} [imageDataUrl] - 可选的图片 data URL（需要 provider 支持视觉）
 * @param {object} [options] - 额外参数 (temperature, max_tokens, model 等)
 * @returns {Promise<string>} AI 返回的文本内容
 */
export async function chat(provider, prompt, imageDataUrl, options = {}) {
  const { client, config } = createClient(provider);

  // 如果传了图片但不支持视觉，降级为纯文本提示
  if (imageDataUrl && !config.features.includes("vision")) {
    console.warn(`[chat] "${config.name}" 不支持视觉输入，已降级为纯文本模式`);
    imageDataUrl = null;
  }

  const content = imageDataUrl
    ? buildMultimodalMessage(prompt, imageDataUrl)
    : prompt;

  try {
    const response = await client.chat.completions.create({
      model: options.model || config.model,
      messages: [{ role: "user", content }],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1000,
    });

    return response.choices[0].message.content;
  } catch (err) {
    const rawMsg = err.message || "";
    // OpenAI SDK 在 API 返回非 JSON（如 HTML 错误页）时会抛 SyntaxError
    if (rawMsg.includes("JSON") || rawMsg.includes("Unexpected token")) {
      throw new Error(
        `"${config.name}" API 返回异常（非 JSON 响应）。请检查：\n` +
        `  1) API Key 是否正确（当前: ${config.envKey}）\n` +
        `  2) 账户是否有可用余额\n` +
        `  3) 模型 "${options.model || config.model}" 是否在控制台已开通`
      );
    }
    throw err;
  }
}
