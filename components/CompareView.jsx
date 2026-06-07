'use client';

import { motion } from 'framer-motion';
import { Eye, Camera, MoveDiagonal } from 'lucide-react';

/**
 * 对比视图：原图 + AI构图辅助线 vs AI 分析结果
 */
export default function CompareView({ originalSrc, result, show = false }) {
  if (!show) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      className="w-full max-w-5xl mx-auto mt-12 space-y-8"
    >
      {/* Section label */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0 },
        }}
        className="text-center"
      >
        <p className="text-xs font-medium text-accent/70 tracking-widest uppercase mb-2">
          Analysis Result
        </p>
        <h2 className="text-2xl font-semibold text-white">
          摄影分析报告
        </h2>
      </motion.div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Original with composition guides */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: -30 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <div className="glass rounded-2xl overflow-hidden">
            {/* Label */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
              <div className="w-2 h-2 rounded-full bg-accent/60" />
              <span className="text-xs font-medium text-muted">你的原片</span>
              <span className="text-[10px] text-muted-subtle ml-auto">构图辅助线</span>
            </div>

            {/* Image with composition overlay */}
            <div className="relative aspect-[4/3] bg-black/40">
              <img
                src={originalSrc}
                alt="原片"
                className="w-full h-full object-contain"
              />

              {/* Rule of thirds grid */}
              <div className="absolute inset-0 comp-grid opacity-50 pointer-events-none" />

              {/* Center focus point */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-24 h-24 rounded-full border border-accent/30" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent/60 rounded-full" />
              </div>

              {/* Golden ratio focus points */}
              {[
                { top: '33.33%', left: '33.33%' },
                { top: '33.33%', left: '66.66%' },
                { top: '66.66%', left: '33.33%' },
                { top: '66.66%', left: '66.66%' },
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <div className="w-full h-full rounded-full border border-accent-purple/25" />
                  <div className="absolute inset-[3px] rounded-full border border-accent-purple/10" />
                </div>
              ))}

              {/* Diagonal guides */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="0" y1="0" x2="100%" y2="100%" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 8" />
                <line x1="100%" y1="0" x2="0" y2="100%" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="4 8" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Right: AI Analysis Result */}
        <motion.div
          variants={{
            hidden: { opacity: 0, x: 30 },
            visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
          }}
        >
          <div className="glass rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Label */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
              <div className="w-2 h-2 rounded-full bg-accent-purple/60 animate-pulse-subtle" />
              <span className="text-xs font-medium text-muted">分析结果</span>
              <span className="text-[10px] text-accent-purple/60 ml-auto">AI Powered</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 overflow-y-auto">
              {result ? (
                <div
                  className="prose prose-invert prose-sm max-w-none
                    prose-headings:text-white/90
                    prose-p:text-white/70 prose-p:leading-relaxed
                    prose-strong:text-accent-purple
                    prose-li:text-white/60
                    prose-li:marker:text-accent/50
                    [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
                    [&_p]:mb-3 [&_ul]:my-3 [&_li]:my-1"
                  dangerouslySetInnerHTML={{
                    __html: result
                      .replace(/^```[\w]*\n?/gm, '')
                      .replace(/\n?```$/gm, '')
                      .replace(/\n/g, '<br/>')
                      .replace(/###?\s*(.+)/g, '<h3>$1</h3>')
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/-\s(.+)/g, '<li>$1</li>')
                      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[200px] text-muted-subtle text-sm">
                  等待分析结果...
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
