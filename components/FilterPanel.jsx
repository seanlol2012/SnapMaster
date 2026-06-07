'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Download, SlidersHorizontal, X, Check } from 'lucide-react';

/* ============ 滤镜引擎 ============ */

function clamp(v) { return Math.max(0, Math.min(255, v)); }

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function mix(a, b, t = 0.5) { return a + (b - a) * t; }

/* ---------- 富士模拟 ---------- */
const fxClassicChrome = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const ns = clamp(s * 0.82);
  const nl = l < 0.5 ? clamp(l * 0.9) : clamp(l * 1.05);
  const hShift = h < 0.2 ? 0.03 : (h > 0.6 ? -0.02 : 0);
  const { r, g, b } = hslToRgb(clamp(h + hShift), ns, nl);
  d[i] = r; d[i + 1] = g; d[i + 2] = b;
};

const fxProvia = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const { r, g, b } = hslToRgb(h, clamp(s * 1.08), clamp(mix(l, 0.5, 0.06)));
  d[i] = r; d[i + 1] = g; d[i + 2] = b;
};

const fxVelvia = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const { r, g, b } = hslToRgb(h, clamp(s * 1.22), clamp(mix(l, 0.5, 0.1)));
  d[i] = r; d[i + 1] = g; d[i + 2] = b;
};

const fxAstia = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const hShift = h > 0.05 && h < 0.15 ? 0.02 : 0;
  const { r, g, b } = hslToRgb(clamp(h + hShift), clamp(s * 0.9), clamp(l * 1.06));
  d[i] = r; d[i + 1] = g; d[i + 2] = b;
};

const fxAcros = (d, i) => {
  const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
  const c = clamp((gray - 128) * 1.3 + 128);
  d[i] = d[i + 1] = d[i + 2] = c;
};

const fxClassicNeg = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const ns = clamp(s * 0.8);
  const nl = l < 0.4 ? clamp(l * 1.15) : clamp(l * 0.92);
  const hShift = l < 0.3 ? 0.03 : -0.01;
  const { r, g, b } = hslToRgb(clamp(h + hShift), ns, nl);
  d[i] = clamp(r * 0.95); d[i + 1] = clamp(g * 0.93); d[i + 2] = clamp(b * 0.95);
};

const fxNostalgic = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const hShift = 0.03;
  const { r, g, b } = hslToRgb(clamp(h + hShift), clamp(s * 0.85), clamp(l * 0.95));
  d[i] = r; d[i + 1] = clamp(g * 0.94); d[i + 2] = clamp(b * 0.88);
};

/* ---------- 胶片风格 ---------- */
const fxPortra400 = (d, i) => {
  d[i] = clamp(d[i] * 1.02); d[i + 1] = clamp(d[i + 1] * 0.95); d[i + 2] = clamp(d[i + 2] * 0.9);
  const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
  if (l < 50) { d[i] += 6; d[i + 1] += 2; }
};

const fxGold200 = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const { r, g, b } = hslToRgb(clamp(h + 0.025), clamp(s * 1.1), clamp(l * 1.04));
  d[i] = r; d[i + 1] = g; d[i + 2] = b;
};

const fxCinestill = (d, i) => {
  d[i + 2] = clamp(d[i + 2] * 1.15);
  d[i] = clamp(d[i] * 0.85); d[i + 1] = clamp(d[i + 1] * 0.95);
  if ((d[i] + d[i + 1] + d[i + 2]) / 3 < 30) d[i + 2] += 10;
};

const fxEktar100 = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const { r, g, b } = hslToRgb(h, clamp(s * 1.15), clamp(mix(l, 0.5, 0.08)));
  d[i] = r; d[i + 1] = g; d[i + 2] = clamp(b * 1.05);
};

const fxLomo = (d, i) => {
  d[i] = clamp(d[i] * 1.1); d[i + 2] = clamp(d[i + 2] * 1.05);
  const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
  if (l < 60) { d[i + 2] += 15; d[i + 1] += 8; }
};

/* ---------- 人像肤色 ---------- */
const fxCreamSkin = (d, i) => {
  const h = rgbToHsl(d[i], d[i + 1], d[i + 2]).h;
  // 只提亮肤色范围（橙-红色调 ≈ h 0.02~0.12），不动其他颜色
  if (h > 0.02 && h < 0.15) {
    const boost = 18;
    d[i] = clamp(d[i] + boost); d[i + 1] = clamp(d[i + 1] + boost * 0.7); d[i + 2] = clamp(d[i + 2] + boost * 0.3);
    // 暖调微调
    d[i] = clamp(d[i] + 3); d[i + 1] = clamp(d[i + 1] + 2);
  }
};

const fxCoolMoon = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const ns = clamp(s * 0.7);
  const nl = clamp(l * 1.1);
  const hShift = -0.015;
  const { r, g, b } = hslToRgb(clamp(h + hShift), ns, nl);
  d[i] = clamp(r + 4); d[i + 1] = clamp(g + 4); d[i + 2] = clamp(b + 12);
};

const fxFirstLove = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const ns = clamp(s * 0.75);
  const nl = clamp(l * 1.13);
  const hShift = -0.01;
  const { r, g, b } = hslToRgb(clamp(h + hShift), ns, nl);
  d[i] = clamp(r + 6); d[i + 1] = clamp(g + 4); d[i + 2] = clamp(b + 8);
};

const fxKoreanIdol = (d, i) => {
  d[i] = clamp(d[i] * 0.95); d[i + 1] = clamp(d[i + 1] * 0.95);
  d[i + 2] = clamp(d[i + 2] * 1.08);
  const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
  const boost = clamp((200 - l) * 0.15 + 10);
  d[i] = clamp(d[i] + boost); d[i + 1] = clamp(d[i + 1] + boost); d[i + 2] = clamp(d[i + 2] + boost);
};

const fxWhiteClear = (d, i) => {
  const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
  const boost = clamp((220 - avg) * 0.35 + 5);
  d[i] = clamp(d[i] + boost);
  d[i + 1] = clamp(d[i + 1] + boost * 0.9);
  d[i + 2] = clamp(d[i + 2] + boost * 1.1);
};

/* ---------- 氛围色调 ---------- */
const fxSunsetGlow = (d, i) => {
  d[i] = clamp(d[i] * 1.08);
  d[i + 1] = clamp(d[i + 1] * 0.92);
  d[i + 2] = clamp(d[i + 2] * 0.7);
  const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
  if (l < 80) { d[i] += 10; d[i + 1] += 5; }
};

const fxMintFresh = (d, i) => {
  d[i + 2] = clamp(d[i + 2] * 1.06);
  d[i + 1] = clamp(d[i + 1] * 1.04);
  d[i] = clamp(d[i] * 0.95);
  const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
  if (l > 180) { d[i + 1] += 5; d[i + 2] += 5; }
};

const fxMoodyDark = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const nl = clamp(l * 0.75);
  const { r, g, b } = hslToRgb(h, clamp(s * 1.05), nl);
  d[i] = r; d[i + 1] = clamp(g * 0.95); d[i + 2] = clamp(b * 0.9);
};

const fxFrenchVintage = (d, i) => {
  d[i] = clamp(d[i] * 1.03); d[i + 1] = clamp(d[i + 1] * 0.93);
  d[i + 2] = clamp(d[i + 2] * 0.82);
  if ((d[i] + d[i + 1] + d[i + 2]) / 3 < 40) { d[i] += 8; d[i + 1] += 4; }
};

const fxAutumnMaple = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const hShift = 0.04;
  const { r, g, b } = hslToRgb(clamp(h + hShift), clamp(s * 1.12), clamp(l * 0.96));
  d[i] = r; d[i + 1] = g; d[i + 2] = clamp(b * 0.88);
};

const fxBlueHour = (d, i) => {
  d[i] = clamp(d[i] * 0.85);
  d[i + 1] = clamp(d[i + 1] * 0.92);
  d[i + 2] = clamp(d[i + 2] * 1.2);
  if ((d[i] + d[i + 1] + d[i + 2]) / 3 < 50) { d[i + 2] += 15; }
};

/* ---------- 风格化 ---------- */
const fxJpFresh = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const { r, g, b } = hslToRgb(clamp(h - 0.02), clamp(s * 0.78), clamp(l * 1.12));
  d[i] = r; d[i + 1] = g; d[i + 2] = b;
};

const fxHkRetro = (d, i) => {
  const { h, s, l } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  const { r, g, b } = hslToRgb(clamp(h + 0.03), clamp(s * 0.9), clamp(l * 0.95));
  d[i] = r; d[i + 1] = clamp(g * 0.9); d[i + 2] = clamp(b * 0.85);
};

const fxMutedGrey = (d, i) => {
  const gray = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
  d[i] = clamp(mix(d[i], gray, 0.55) + 8);
  d[i + 1] = clamp(mix(d[i + 1], gray, 0.55) + 8);
  d[i + 2] = clamp(mix(d[i + 2], gray, 0.55) + 8);
};

const fxCyberpunk = (d, i) => {
  d[i] = clamp(d[i] * 0.8); d[i + 1] = clamp(d[i + 1] * 0.85);
  d[i + 2] = clamp(d[i + 2] * 1.35);
  const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
  if (l < 60) { d[i] += 12; d[i + 2] += 18; }
  if (l > 200) d[i + 2] += 10;
};

const fxWarmVintage = (d, i) => {
  d[i] = clamp(d[i] * 1.08); d[i + 1] = clamp(d[i + 1] * 0.95);
  d[i + 2] = clamp(d[i + 2] * 0.78);
};

const fxTealOrange = (d, i) => {
  const { h } = rgbToHsl(d[i], d[i + 1], d[i + 2]);
  if (h < 0.12) {
    d[i] = clamp(d[i] * 1.1); d[i + 1] = clamp(d[i + 1] * 0.9); d[i + 2] = clamp(d[i + 2] * 0.7);
  } else {
    d[i] = clamp(d[i] * 0.8); d[i + 1] = clamp(d[i + 1] * 0.9); d[i + 2] = clamp(d[i + 2] * 1.15);
  }
};

/* ============ 滤镜注册表 ============ */

const FILTER_CATEGORIES = [
  {
    label: '🎞️ 富士模拟',
    filters: [
      { id: 'classic-chrome', label: 'Classic Chrome', desc: '低饱和 · 高对比', fn: fxClassicChrome },
      { id: 'provia', label: 'PROVIA', desc: '标准色彩 · 自然', fn: fxProvia },
      { id: 'velvia', label: 'Velvia', desc: '鲜艳模式 · 风光', fn: fxVelvia },
      { id: 'astia', label: 'ASTIA', desc: '柔和人像神器', fn: fxAstia },
      { id: 'acros', label: 'ACROS', desc: '黑白胶片 · 层次丰富', fn: fxAcros },
      { id: 'classic-neg', label: 'Classic Neg.', desc: '经典负片 · 青调复古', fn: fxClassicNeg },
      { id: 'nostalgic', label: 'Nostalgic Neg.', desc: '怀旧琥珀暖调', fn: fxNostalgic },
    ],
  },
  {
    label: '🎬 胶片日记',
    filters: [
      { id: 'portra', label: 'Portra 400', desc: '肤色透亮 · 人像首选', fn: fxPortra400 },
      { id: 'gold', label: 'Gold 200', desc: '金色暖阳 · 日常百搭', fn: fxGold200 },
      { id: 'ektar', label: 'Ektar 100', desc: '浓郁饱和 · 风光利器', fn: fxEktar100 },
      { id: 'cinestill', label: 'Cinestill 800T', desc: '冷调电影感', fn: fxCinestill },
      { id: 'lomo', label: 'LOMO', desc: '暗角浓彩 · 复古随性', fn: fxLomo },
    ],
  },
  {
    label: '💄 人像肤色',
    filters: [
      { id: 'cream-skin', label: '奶油肌', desc: '白皙透亮 · 一键磨皮感', fn: fxCreamSkin },
      { id: 'cool-moon', label: '清冷白月光', desc: '冷白皮 · 清透感', fn: fxCoolMoon },
      { id: 'first-love', label: '初恋感', desc: '粉嫩通透 · 少女感', fn: fxFirstLove },
      { id: 'korean', label: '韩系 idol 风', desc: '韩式冷白 · 高级感', fn: fxKoreanIdol },
      { id: 'white-clear', label: '白开水妆', desc: '通透干净 · 素颜感', fn: fxWhiteClear },
    ],
  },
  {
    label: '🌅 氛围色调',
    filters: [
      { id: 'sunset', label: '日落大道', desc: '暖橘金光 · 夕阳感', fn: fxSunsetGlow },
      { id: 'mint', label: '薄荷轻氧', desc: '清新薄荷绿调', fn: fxMintFresh },
      { id: 'moody', label: '暗调高级', desc: '暗黑质感 · 氛围拉满', fn: fxMoodyDark },
      { id: 'french', label: '法式慵懒', desc: '微暖低饱和 · 南法午后', fn: fxFrenchVintage },
      { id: 'maple', label: '秋日枫叶', desc: '浓郁暖棕橘调', fn: fxAutumnMaple },
      { id: 'blue-hour', label: '蓝调时刻', desc: '暮光蓝紫 · 浪漫感', fn: fxBlueHour },
    ],
  },
  {
    label: '🎨 风格调色',
    filters: [
      { id: 'japanese', label: '日系清新', desc: '明亮通透 · 低饱和', fn: fxJpFresh },
      { id: 'vintage', label: '港风复古', desc: '王家卫电影感', fn: fxHkRetro },
      { id: 'muted', label: '高级灰', desc: '低饱和胶片灰', fn: fxMutedGrey },
      { id: 'warm-old', label: '怀旧暖调', desc: '旧时光蜡黄色', fn: fxWarmVintage },
      { id: 'teal-orange', label: '青橙色调', desc: '电影级冷暖对比', fn: fxTealOrange },
      { id: 'cyberpunk', label: '赛博朋克', desc: '蓝紫霓虹 · 科技感', fn: fxCyberpunk },
    ],
  },
];

/* ============ 组件 ============ */

export default function FilterPanel() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [intensity, setIntensity] = useState(100);
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(null);
  const canvasRef = useRef(null);
  const origImgDataRef = useRef(null);
  const wRef = useRef(0);
  const hRef = useRef(0);

  // 上传图片
  const handleFile = useCallback((f) => {
    setFile(f); setActiveFilter(null);
    setReady(false);
    origImgDataRef.current = null;
    wRef.current = 0; hRef.current = 0;
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  // preview 变化 → 画图到 Canvas
  useEffect(() => {
    if (!preview) return;
    const img = new Image();
    img.onload = () => {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const maxW = 800;
      const scale = img.width > maxW ? maxW / img.width : 1;
      wRef.current = Math.round(img.width * scale);
      hRef.current = Math.round(img.height * scale);
      cvs.width = wRef.current;
      cvs.height = hRef.current;
      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0, wRef.current, hRef.current);
      origImgDataRef.current = ctx.getImageData(0, 0, wRef.current, hRef.current);
      setDisplaySrc(preview);
      setReady(true);
      console.log(`[滤镜工坊] 图片已加载 ${wRef.current}x${hRef.current}`);
    };
    img.src = preview;
  }, [preview]);

  // 应用滤镜 → Canvas → data URL
  const applyFilter = useCallback((filter, iVal) => {
    const cvs = canvasRef.current;
    if (!cvs || !origImgDataRef.current || wRef.current === 0) return;
    const ctx = cvs.getContext('2d');
    ctx.putImageData(origImgDataRef.current, 0, 0);

    if (!filter) { setDisplaySrc(preview); return; }

    const imageData = ctx.getImageData(0, 0, wRef.current, hRef.current);
    const d = imageData.data;
    const { fn } = filter;
    const t = iVal / 100;

    for (let i = 0; i < d.length; i += 4) {
      const r0 = d[i], g0 = d[i + 1], b0 = d[i + 2];
      fn(d, i);
      d[i] = clamp(mix(r0, d[i], t));
      d[i + 1] = clamp(mix(g0, d[i + 1], t));
      d[i + 2] = clamp(mix(b0, d[i + 2], t));
    }
    ctx.putImageData(imageData, 0, 0);
    setDisplaySrc(cvs.toDataURL('image/jpeg', 0.92));
  }, [preview]);

  const selectFilter = (f) => {
    const next = activeFilter?.id === f.id ? null : f;
    setActiveFilter(next);
    applyFilter(next, intensity);
    if (next) console.log(`[滤镜工坊] ${next.label} (强度: ${intensity}%)`);
    else console.log('[滤镜工坊] 恢复原图');
  };

  const handleIntensity = (v) => {
    setIntensity(v);
    if (activeFilter) applyFilter(activeFilter, v);
  };

  const handleDownload = () => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const link = document.createElement('a');
    link.download = 'filtered.jpg';
    link.href = cvs.toDataURL('image/jpeg', 0.92);
    link.click();
  };

  const reset = () => {
    setFile(null); setPreview(null); setActiveFilter(null); setIntensity(100);
    setDisplaySrc(null); origImgDataRef.current = null; setReady(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Canvas 始终挂载在 DOM 外层 */}
      <canvas ref={canvasRef} className="hidden" />

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto"
          >
            <label className="upload-dashed relative flex flex-col items-center justify-center min-h-[280px] p-12 cursor-pointer transition-all duration-300 group">
              <div className="relative mb-5 w-16 h-16 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] group-hover:border-accent/30 transition-all duration-500">
                <Upload size={28} className="text-muted-foreground group-hover:text-accent transition-colors" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-white/90 mb-2">上传照片，一键套用滤镜</h3>
              <p className="text-sm text-muted">支持 JPG / PNG / WebP</p>
              <input
                type="file" accept="image/*"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                className="hidden"
              />
            </label>
          </motion.div>
        ) : (
          <motion.div key="editor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex gap-6 flex-col lg:flex-row">
              {/* 左侧预览 */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted uppercase tracking-wider">
                    {activeFilter ? `滤镜：${activeFilter.label}` : '点击下方滤镜预览效果'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={reset} className="px-3 py-1.5 text-xs rounded-lg bg-white/[0.03] border border-white/[0.08] text-muted hover:text-white transition-colors">
                      更换照片
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-accent/[0.12] border border-accent/20 text-accent hover:bg-accent/[0.2] transition-colors">
                      <Download size={12} /> 下载
                    </button>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-black/20 min-h-[300px] flex items-center justify-center">
                  {ready && displaySrc ? (
                    <img src={displaySrc} alt="预览" className="max-w-full max-h-[500px] object-contain rounded-xl" />
                  ) : (
                    preview && <img src={preview} alt="原图" className="max-w-full max-h-[500px] object-contain rounded-xl" />
                  )}
                </div>

                {activeFilter && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <SlidersHorizontal size={14} className="text-muted" />
                    <span className="text-xs text-muted whitespace-nowrap">滤镜强度</span>
                    <input
                      type="range" min="10" max="100" value={intensity}
                      onChange={(e) => handleIntensity(Number(e.target.value))}
                      className="flex-1 h-1.5 rounded-full appearance-none bg-white/[0.08] cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent
                        [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(91,91,212,0.4)]"
                    />
                    <span className="text-xs font-mono text-white/60 w-8 text-right">{intensity}%</span>
                    <button
                      onClick={() => { setActiveFilter(null); setIntensity(100); applyFilter(null, 100); }}
                      className="p-1 rounded-md hover:bg-white/[0.06] text-muted-subtle hover:text-white/60 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* 右侧滤镜列表 */}
              <div className="lg:w-[340px] flex-shrink-0">
                <div className="sticky top-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                  <div className="flex gap-1.5 flex-wrap">
                    {FILTER_CATEGORIES.map((cat, idx) => (
                      <button
                        key={cat.label}
                        onClick={() => setCategoryIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                          idx === categoryIdx
                            ? 'bg-accent/[0.1] text-accent border border-accent/20'
                            : 'bg-white/[0.03] text-muted border border-white/[0.06] hover:border-white/[0.12]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {FILTER_CATEGORIES[categoryIdx].filters.map((f) => {
                      const isActive = activeFilter?.id === f.id;
                      return (
                        <motion.button
                          key={f.id}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => selectFilter(f)}
                          className={`relative flex flex-col items-start gap-1 p-3 rounded-xl text-left transition-all duration-200 ${
                            isActive
                              ? 'bg-accent/[0.08] border border-accent/25 shadow-[0_0_12px_rgba(91,91,212,0.08)]'
                              : 'bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 w-full">
                            {isActive && <Check size={12} className="text-accent shrink-0" />}
                            <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
                              {f.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-subtle leading-tight">{f.desc}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
