'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import ModelSwitcher from './ModelSwitcher';

export default function Header({
  hasVision = true,
  hasImage = true,
  providers = [],
  currentProvider = '',
  onProviderChange = () => {},
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="pt-12 pb-8 text-center relative"
    >
      {/* Model Switcher - positioned top-right */}
      {providers.length > 1 && (
        <div className="absolute top-12 right-4 md:right-8">
          <ModelSwitcher
            providers={providers}
            current={currentProvider}
            onChange={onProviderChange}
          />
        </div>
      )}

      {/* Logo mark */}
      <div className="inline-flex items-center justify-center w-12 h-12 mb-6
        rounded-2xl bg-gradient-to-br from-accent to-accent-purple
        shadow-[0_0_30px_rgba(91,91,212,0.15)]">
        <Camera size={22} strokeWidth={1.5} className="text-white" />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
        <span className="text-gradient">SnapMaster</span>
      </h1>

      {/* Subtitle */}
      <p className="text-base md:text-lg text-muted max-w-md mx-auto leading-relaxed">
        AI 摄影助手 — 智能构图分析 · 修图 · Prompt 优化
      </p>

      {/* Capability status pills */}
      <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5
          rounded-full text-[11px] font-medium
          bg-white/[0.04] border border-white/[0.06] text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-pulse-subtle" />
          AI 就绪
        </span>

        <span className={`
          inline-flex items-center gap-1 px-3 py-1.5
          rounded-full text-[11px] font-medium border
          transition-all duration-500
          ${hasVision
            ? 'bg-green-500/[0.06] border-green-500/[0.15] text-green-400/80'
            : 'bg-red-500/[0.06] border-red-500/[0.15] text-red-400/60'
          }
        `}>
          {hasVision ? '👁️' : '🚫'} 视觉
        </span>

        <span className={`
          inline-flex items-center gap-1 px-3 py-1.5
          rounded-full text-[11px] font-medium border
          transition-all duration-500
          ${hasImage
            ? 'bg-green-500/[0.06] border-green-500/[0.15] text-green-400/80'
            : 'bg-red-500/[0.06] border-red-500/[0.15] text-red-400/60'
          }
        `}>
          {hasImage ? '🎨' : '🚫'} 生图
        </span>
      </div>
    </motion.header>
  );
}
