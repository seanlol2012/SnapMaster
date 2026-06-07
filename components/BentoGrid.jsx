'use client';

import { motion } from 'framer-motion';
import { Camera, Wand2, Sparkles, ArrowRight } from 'lucide-react';

const cards = [
  {
    id: 'coach',
    icon: Camera,
    title: '摄影教练',
    desc: '上传一张现场照片，AI 诊断构图问题，告诉你机位、参数怎么调。',
    gradient: 'from-accent to-accent-purple',
    size: 'md:col-span-2 md:row-span-1',
    active: true,
  },
  {
    id: 'edit',
    icon: Wand2,
    title: '智能修图',
    desc: '描述你的修改需求，AI 将原图 + 指令翻译为专业生图 Prompt 并生成效果。',
    gradient: 'from-accent-purple to-accent-cyan',
    size: 'md:col-span-1 md:row-span-2',
    active: true,
  },
  {
    id: 'optimize',
    icon: Sparkles,
    title: 'Prompt 优化',
    desc: '输入原始提示词，AI 补充光线、构图、画质关键词，让生图质量飞跃。',
    gradient: 'from-accent-cyan to-accent-blue',
    size: 'md:col-span-1 md:row-span-1',
    active: true,
  },
  {
    id: 'compare',
    icon: ArrowRight,
    title: '对比分析',
    desc: '并排查看原图与 AI 构图分析，直观理解每一条建议背后的视觉逻辑。',
    gradient: 'from-accent via-accent-purple to-accent-cyan',
    size: 'md:col-span-2 md:row-span-1',
    active: true,
  },
];

export default function BentoGrid({ onCardClick, disabledCards = [], features = [] }) {
  return (
    <div className="w-full max-w-5xl mx-auto mt-20">
      {/* Section label */}
      <div className="mb-8 text-center">
        <p className="text-xs font-medium text-muted-foreground tracking-[0.2em] uppercase mb-2">
          Capabilities
        </p>
        <h2 className="text-xl font-semibold text-white/80">
          一站式摄影 AI 工作台
        </h2>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, i) => {
          const isDisabled = disabledCards.includes(card.id);
          const Icon = card.icon;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => !isDisabled && onCardClick?.(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isDisabled) onCardClick?.(card.id);
                }}
                className={`
                  ${card.size}
                  glass rounded-2xl p-6 h-full
                  transition-all duration-300 group cursor-pointer
                  ${isDisabled
                    ? 'opacity-30 cursor-not-allowed'
                    : 'hover:border-white/[0.14] hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset]'
                  }
                `}
              >
                {/* Icon with gradient background */}
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center mb-4
                  bg-gradient-to-br ${card.gradient} bg-opacity-10
                  transition-all duration-300
                  ${!isDisabled ? 'group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(91,91,212,0.15)]' : ''}
                `}>
                  <Icon size={20} strokeWidth={1.5} className="text-white/80" />
                </div>

                {/* Title */}
                <h3 className={`
                  text-base font-semibold mb-2 transition-colors duration-300
                  ${!isDisabled ? 'text-white/90 group-hover:text-white' : 'text-white/50'}
                `}>
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted leading-relaxed">
                  {card.desc}
                </p>

                {/* Subtle arrow indicator */}
                {!isDisabled && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-accent/50 opacity-0
                    group-hover:opacity-100 transition-all duration-300">
                    <span>尝试</span>
                    <ArrowRight size={12} />
                  </div>
                )}

                {isDisabled && (
                  <p className="mt-4 text-[11px] text-red-400/40">
                    当前模型不支持此功能
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
