# SnapMaster

**AI 摄影助手 — 从构图诊断到智能修图，一站式摄影工作流。**

SnapMaster 将 AI 大模型能力注入摄影创作全流程：分析你的照片构图问题并给出精确到光圈快门值的改进方案、一键套用 29 种高品质滤镜、将自然语言描述优化为包含完整相机参数的摄影级 Prompt、以及 AI 驱动的智能修图。

---

## ✨ 功能

### 📸 摄影教练
上传照片，AI 以资深商业摄影师视角给出分析报告：

- **构图诊断**：指出画面硬伤，给出具体画面参照物和判断依据
- **相机参数指导**：推荐精确的 `f/` 值、焦段 `mm`、ISO、快门速度
- **模特调度**：精确到身体每个部位的姿态调整建议
- **光线运用**：分析当前光线问题并给出具体避光/补光方案

### 🎨 滤镜工坊
上传照片，实时预览 29 种专业滤镜效果，支持强度调节和下载。

| 分类 | 滤镜 |
|------|------|
| 🎞️ 富士模拟 | Classic Chrome, PROVIA, Velvia, ASTIA, ACROS, Classic Neg., Nostalgic Neg. |
| 🎬 胶片日记 | Kodak Portra 400, Gold 200, Ektar 100, Cinestill 800T, LOMO |
| 💄 人像肤色 | 奶油肌, 清冷白月光, 初恋感, 韩系 Idol 风, 白开水妆 |
| 🌅 氛围色调 | 日落大道, 薄荷轻氧, 暗调高级, 法式慵懒, 秋日枫叶, 蓝调时刻 |
| 🎨 风格调色 | 日系清新, 港风复古, 高级灰, 怀旧暖调, 青橙色调, 赛博朋克 |

> 纯前端 Canvas 像素级处理，不调用任何 API，秒级响应。

### ✨ 智能修图
上传照片 + 输入修改指令（如「把背景换成星空」），AI 生成修改后的照片。自动保持原图长宽比。

### 🧠 Prompt 优化
输入简单描述（如「海边日落」），AI 将其扩展为包含完整相机参数的摄影级英文 Prompt：

```
A woman walking on a beach at sunset, shot on Canon EOS R5 with 85mm f/1.4 
prime lens, f/1.4 aperture creating extreme shallow depth of field, 1/500s 
shutter speed, ISO 100, golden hour backlight, rule of thirds composition, 
Kodak Portra 400 warm tones, photorealistic, 8K, masterpiece
```

输出直接可粘贴到 Midjourney / DALL-E / Stable Diffusion 使用。

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- 至少一个 AI 提供商的 API Key（推荐智谱）

### 安装与启动

```bash
git clone <repo-url>
cd SnapMaster
npm install
```

**方式一：双击启动（推荐）**

```
双击 start.bat  →  自动检查依赖、清理端口、启动前后端服务
双击 stop.bat   →  一键关闭所有服务
```

**方式二：命令行**

```bash
npm start       # 同时启动前端(3000) + API(3001)
```

首次运行会提示创建 `.env` 模板，编辑填入 API Key 后重新启动即可。

### 配置

编辑项目根目录的 `.env` 文件，填入至少一个 API Key：

```env
# 推荐：智谱（支持视觉分析 + 图像生成）
ZHIPU_API_KEY=your_key_here
```

支持的提供商：`zhipu` | `openai` | `gemini` | `deepseek` | `doubao` | `custom`

页面右上角可随时切换模型。

---

## 🏗️ 技术架构

```
SnapMaster/
├── app/                  # Next.js 前端页面
│   └── page.js           # 主页面（4 个 Tab）
├── components/           # React 组件
│   ├── FilterPanel.jsx   # 滤镜工坊（29 种滤镜 + Canvas 渲染引擎）
│   ├── CompareView.jsx   # 摄影教练对比视图
│   ├── ModelSwitcher.jsx # AI 模型切换器
│   └── ...
├── src/
│   ├── agents/           # AI Agent 编排
│   │   ├── coach.js      # 摄影教练
│   │   ├── photoEditor.js # 智能修图
│   │   └── promptOptimizer.js # Prompt 优化
│   ├── prompts/          # Prompt 模板
│   ├── services/         # AI 客户端（OpenAI SDK）
│   ├── config/           # 提供商注册表
│   └── utils/            # 图像工具（尺寸读取、EXIF 解析）
├── start.bat / stop.bat  # 一键启停
└── .env                  # API Key 配置
```

**技术栈**：Next.js 14 · React 18 · Express 5 · Tailwind CSS · Framer Motion · OpenAI SDK · LangGraph

**设计特点**：
- 多模型统一适配：所有 AI 提供商通过 OpenAI 兼容接口接入，一键切换
- 滤镜引擎：纯前端 Canvas 像素级 HSL 色彩空间变换，零延迟实时渲染
- EXIF 感知：自动解析 JPEG 朝向信息，保持长宽比
- 命令式 Canvas 操作：滤镜渲染不依赖 React effect 调度，点击即生效

---

## 📄 License

MIT
