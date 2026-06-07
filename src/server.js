/**
 * SnapMaster Web 服务
 * Express 服务器 + API 路由 + 静态文件
 */

import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { getProviderConfig, listProviders, getAvailableProviders } from "./config/providers.js";
import { coachPhoto } from "./agents/coach.js";
import { editPhoto } from "./agents/photoEditor.js";
import { optimizePrompt } from "./agents/promptOptimizer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.API_PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 文件上传配置
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

const defaultProvider = process.env.AI_PROVIDER || "zhipu";

/**
 * 从请求中提取 provider 参数（优先级：body > query > 默认值）
 */
function getReqProvider(req) {
  return req.body?.provider || req.query?.provider || defaultProvider;
}

/**
 * 解析 provider 配置，失败时抛出友好错误
 */
function resolveConfig(provider) {
  try {
    return getProviderConfig(provider);
  } catch (e) {
    throw Object.assign(new Error(e.message), { statusCode: 400 });
  }
}

// ========== API 路由 ==========

// 0. 获取服务状态 + 可用模型列表
app.get("/api/status", (req, res) => {
  const provider = getReqProvider(req);
  let config;
  try { config = getProviderConfig(provider); } catch { config = null; }
  const available = getAvailableProviders();

  res.json({
    provider,
    defaultProvider,
    name: config?.name || provider,
    features: config?.features || [],
    note: config?.note || null,
    availableProviders: available,
    allProviders: listProviders(),
  });
});

// 列出所有可用的提供商（前端模型切换器用）
app.get("/api/providers", (req, res) => {
  res.json({
    providers: getAvailableProviders(),
    default: defaultProvider,
  });
});

// 1. 摄影教练：分析照片构图与参数
app.post("/api/coach", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "请上传一张照片" });

    const provider = getReqProvider(req);
    const config = resolveConfig(provider);

    if (!config.features.includes("vision")) {
      return res.status(400).json({
        error: `"${config.name}" 不支持图片视觉分析，请切换到支持视觉的模型`,
      });
    }

    const result = await coachPhoto(req.file, provider);
    res.json(result);
  } catch (err) {
    console.error("[Coach]", err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// 2. 图片编辑：根据指令修改照片
app.post("/api/edit", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "请上传一张照片" });

    const provider = getReqProvider(req);
    const config = resolveConfig(provider);

    if (!config.features.includes("vision")) {
      return res.status(400).json({
        error: `"${config.name}" 不支持图片视觉分析，请切换到支持视觉的模型`,
      });
    }

    const instruction = req.body.instruction;
    if (!instruction) return res.status(400).json({ error: "请输入修改指令" });

    const result = await editPhoto(req.file, instruction, provider);
    res.json(result);
  } catch (err) {
    console.error("[Edit]", err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// 3. Prompt 优化器（纯文本，所有模型通用）
app.post("/api/optimize-prompt", async (req, res) => {
  try {
    const { prompt: rawPrompt } = req.body;
    if (!rawPrompt) return res.status(400).json({ error: "请输入原始 Prompt" });

    const provider = getReqProvider(req);

    const result = await optimizePrompt(rawPrompt, provider);
    res.json(result);
  } catch (err) {
    console.error("[Optimize]", err.message);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// 首页
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 启动
app.listen(PORT, () => {
  const available = getAvailableProviders();
  const config = getProviderConfig(defaultProvider);
  const features = config.features.map(f => {
    const map = { chat: "💬 文本", vision: "👁️ 视觉", image: "🎨 生图" };
    return map[f] || f;
  }).join(" | ");

  console.log(`
╔══════════════════════════════════════════════════╗
║   📸 SnapMaster API 服务                        ║
║   API 地址: http://localhost:${PORT}                    ║
║   默认模型: ${(config.name + " (" + defaultProvider + ")").padEnd(40)}║
║   支持功能: ${features.padEnd(42)}║
║   可用模型: ${available.map(p => p.id).join(", ").padEnd(42)}║
╚══════════════════════════════════════════════════╝
  `);
});
