/**
 * AI 提供商通用注册表
 *
 * 所有主流模型均兼容 OpenAI API 格式，只需配 baseURL + model + API Key 即可切换。
 * 用户在 .env 中设置 AI_PROVIDER 和对应 API_KEY，其余全部自动适配。
 *
 * 支持的提供商：
 *   openai   - OpenAI GPT-4o / DALL-E 3
 *   gemini   - Google Gemini（OpenAI 兼容端点）
 *   zhipu    - 智谱 GLM-4V / CogView
 *   deepseek - DeepSeek（纯文本，暂不支持视觉）
 *   doubao   - 字节豆包（火山方舟 Ark）
 *   custom   - 自定义兼容端点（ollama / vllm / 任意 OpenAI 兼容服务）
 */

import "dotenv/config";

// ============ 提供商静态注册表 ============
// 每个条目定义：名称、OpenAI 兼容 baseURL、API Key 的环境变量名、模型名、可选生图模型、文档链接
const PROVIDERS = {

  openai: {
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    envKey: "OPENAI_API_KEY",
    model: "gpt-4o",                 // 视觉理解 + 文本
    imageModel: "dall-e-3",          // 图像生成
    doc: "https://platform.openai.com/api-keys",
    features: ["chat", "vision", "image"],
  },

  gemini: {
    name: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    envKey: "GEMINI_API_KEY",
    model: "gemini-2.5-flash",       // 视觉理解 + 文本
    imageModel: "imagen-4.0-generate-001",
    doc: "https://aistudio.google.com/apikey",
    features: ["chat", "vision"],
    note: "图像生成需走独立 Imagen API，暂通过文本描述替代",
  },

  zhipu: {
    name: "智谱 GLM",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    envKey: "ZHIPU_API_KEY",
    model: "glm-4v",                 // 视觉理解
    imageModel: "cogview-4",         // 图像生成
    doc: "https://open.bigmodel.cn/usercenter/apikeys",
    features: ["chat", "vision", "image"],
  },

  deepseek: {
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com",
    envKey: "DEEPSEEK_API_KEY",
    model: "deepseek-chat",          // 纯文本（无视觉）
    imageModel: null,
    doc: "https://platform.deepseek.com/api_keys",
    features: ["chat"],
    note: "DeepSeek 暂不支持图片输入，摄影教练和智能修图功能不可用，仅 Prompt 优化功能可用",
  },

  doubao: {
    name: "字节豆包",
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    envKey: "DOUBAO_API_KEY",
    model: "doubao-vision-pro-32k",  // 视觉理解
    imageModel: null,
    doc: "https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey",
    features: ["chat", "vision"],
    note: "图像生成需走即梦/Seedream 独立 API，智能修图的结果图为文本描述",
  },

  custom: {
    name: "自定义",
    baseURL: process.env.CUSTOM_BASE_URL || "http://localhost:11434/v1",
    envKey: "CUSTOM_API_KEY",
    model: process.env.CUSTOM_MODEL || "llama3.2-vision",
    imageModel: process.env.CUSTOM_IMAGE_MODEL || null,
    doc: "自行配置",
    features: ["chat"],
    note: "通过 CUSTOM_BASE_URL / CUSTOM_MODEL / CUSTOM_IMAGE_MODEL 定制",
  },
};

// ============ 动态配置解析 ============

/**
 * 读取 API Key —— 统一入口
 * 优先级：提供商专属环境变量 > 通用 SNAPMASTER_API_KEY
 */
function resolveApiKey(envKey) {
  const specific = process.env[envKey];
  if (specific) return specific;

  const generic = process.env.SNAPMASTER_API_KEY;
  if (generic) return generic;

  return undefined;
}

/**
 * 获取指定提供商的可运行配置
 * @param {string} provider - 提供商 ID
 * @returns {{ name, baseURL, apiKey, model, imageModel, features, note }}
 */
export function getProviderConfig(provider = "zhipu") {
  const key = provider?.toLowerCase();
  const entry = PROVIDERS[key];

  if (!entry) {
    const list = Object.keys(PROVIDERS).join(" | ");
    throw new Error(`未知提供商 "${provider}"，可选: ${list}`);
  }

  const apiKey = resolveApiKey(entry.envKey);

  if (!apiKey) {
    throw new Error(
      `未找到 "${entry.name}" 的 API Key。请在 .env 中设置 ${entry.envKey} ` +
      `（或设置通用变量 SNAPMASTER_API_KEY）。\n` +
      `获取地址: ${entry.doc}`
    );
  }

  return {
    name: entry.name,
    baseURL: entry.baseURL,
    apiKey,
    model: entry.model,
    imageModel: entry.imageModel,
    features: entry.features,
    note: entry.note || null,
  };
}

/**
 * 列出所有注册的提供商
 * @returns {{ id: string, name: string, features: string[], note?: string }[]}
 */
export function listProviders() {
  return Object.entries(PROVIDERS).map(([id, p]) => ({
    id,
    name: p.name,
    features: p.features,
    note: p.note || null,
  }));
}

/**
 * 检测当前环境变量中已配置了哪些提供商的 API Key
 * （不校验 key 有效性，只检查是否已设置）
 * @returns {{ id: string, name: string, features: string[] }[]}
 */
export function getAvailableProviders() {
  return Object.entries(PROVIDERS)
    .filter(([, p]) => {
      const key = process.env[p.envKey];
      const generic = process.env.SNAPMASTER_API_KEY;
      return !!(key || generic);
    })
    .map(([id, p]) => ({
      id,
      name: p.name,
      features: p.features,
    }));
}

export default PROVIDERS;
