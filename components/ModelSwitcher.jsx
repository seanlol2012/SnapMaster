'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Cpu } from 'lucide-react';

export default function ModelSwitcher({
  providers = [],
  current,
  onChange,
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // 点击外部关闭
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentProvider = providers.find((p) => p.id === current) || {
    id: current,
    name: current,
    features: [],
  };

  if (providers.length <= 1) return null;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-xl
          bg-white/[0.03] border border-white/[0.08]
          hover:border-white/[0.14] hover:bg-white/[0.05]
          transition-all duration-200 group
        "
      >
        <Cpu size={14} strokeWidth={1.5} className="text-muted group-hover:text-white/70 transition-colors" />
        <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors max-w-[80px] truncate">
          {currentProvider.name}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={`text-muted-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="
              absolute right-0 top-full mt-2 z-50
              glass-elevated rounded-xl p-1.5 min-w-[180px]
              shadow-[0_12px_40px_rgba(0,0,0,0.6)]
            "
          >
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[10px] font-medium text-muted-subtle uppercase tracking-wider">
                切换模型
              </p>
            </div>

            {providers.map((p) => {
              const isActive = p.id === current;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                    text-sm transition-all duration-150
                    ${isActive
                      ? 'bg-accent/[0.1] text-white'
                      : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-medium">{p.name}</span>
                    <span className="flex items-center gap-1">
                      {p.features.includes('vision') && (
                        <span className="text-[10px] text-green-400/60" title="支持视觉">👁️</span>
                      )}
                      {p.features.includes('image') && (
                        <span className="text-[10px] text-purple-400/60" title="支持生图">🎨</span>
                      )}
                    </span>
                  </div>
                  {isActive && <Check size={14} strokeWidth={2} className="text-accent" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
