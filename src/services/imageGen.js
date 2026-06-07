/**
 * 图像生成服务模块
 * 封装各提供商的图生图 / 文生图 API 调用
 * 所有支持 images.generate 的供应商统一走此服务
 */

import OpenAI from "openai";
import { getProviderConfig } from "../config/providers.js";

/**
 * 检查当前提供商是否支持图像生成
 */
export function supportsImageGen(provider = "zhipu") {
  try {
    const config = getProviderConfig(provider);
    return config.features.includes("image") && !!config.imageModel;
  } catch {
    return false;
  }
}

/**
 * 文生图：根据 Prompt 生成图片
 * @param {string} prompt - 图像生成 Prompt
 * @param {string} [provider="zhipu"] - 提供商
 * @param {object} [options] - 可选参数
 * @returns {Promise<{url: string, revisedPrompt?: string}>}
 */
export async function generateImage(prompt, provider = "zhipu", options = {}) {
  const config = getProviderConfig(provider);

  if (!config.imageModel) {
    throw new Error(
      `"${config.name}" 不支持图像生成。支持生图的提供商: ` +
      `openai (DALL-E 3), zhipu (CogView)`
    );
  }

  const client = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
  });

  try {
    const response = await client.images.generate({
      model: config.imageModel,
      prompt,
      n: options.n ?? 1,
      size: options.size ?? "1024x1024",
    });

    const image = response.data[0];
    return {
      url: image.url,
      revisedPrompt: image.revised_prompt || prompt,
    };
  } catch (err) {
    const rawMsg = err.message || "";
    if (rawMsg.includes("JSON") || rawMsg.includes("Unexpected token")) {
      throw new Error(
        `"${config.name}" 生图 API 返回异常（非 JSON 响应）。请检查 API Key 和账户余额。`
      );
    }
    throw err;
  }
}
