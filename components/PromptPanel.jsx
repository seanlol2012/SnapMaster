'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check } from 'lucide-react';
import ShimmerButton from './ShimmerButton';
import { optimizePrompt } from '@/lib/api';

export default function PromptPanel({ open, onClose, provider = '' }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await optimizePrompt(input, provider || undefined);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.data?.optimized) {
      await navigator.clipboard.writeText(result.data.optimized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative glass-elevated rounded-2xl p-6 md:p-8
              w-full max-w-lg max-h-[85vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl
                hover:bg-white/[0.06] transition-colors duration-200"
            >
              <X size={18} className="text-muted" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-blue
                flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Prompt 优化器</h2>
                <p className="text-xs text-muted-foreground">将你的想法提炼为专业生图 Prompt</p>
              </div>
            </div>

            {/* Input */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的原始 Prompt，例如：一只猫坐在窗边..."
              rows={3}
              className="w-full p-4 rounded-xl text-sm
                bg-white/[0.03] border border-white/[0.08]
                text-white placeholder:text-muted-subtle
                focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10
                resize-none transition-all duration-300"
            />

            {/* Submit */}
            <ShimmerButton onClick={handleSubmit} disabled={loading || !input.trim()} className="w-full mt-4">
              {loading ? '优化中...' : '✨ 优化 Prompt'}
            </ShimmerButton>

            {error && (
              <p className="mt-3 text-sm text-red-400/80 bg-red-500/[0.06] border border-red-500/[0.12] rounded-lg p-3">
                {error}
              </p>
            )}

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 space-y-4 overflow-hidden"
                >
                  <div className="border-t border-white/[0.06] pt-4">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      原始 Prompt
                    </p>
                    <p className="text-sm text-white/50 bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
                      {result.data?.original || input}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-medium text-accent-cyan/70 uppercase tracking-wider">
                        优化后 Prompt
                      </p>
                      <button
                        onClick={handleCopy}
                        className={`
                          flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px]
                          transition-all duration-200
                          ${copied
                            ? 'bg-green-500/[0.1] text-green-400 border border-green-500/[0.2]'
                            : 'bg-white/[0.03] text-muted border border-white/[0.06] hover:border-white/[0.12]'
                          }
                        `}
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? '已复制' : '复制'}
                      </button>
                    </div>
                    <div className="bg-accent/[0.04] border border-accent/[0.1] rounded-xl p-4
                      text-sm text-white/80 leading-relaxed font-mono">
                      {result.data?.optimized || ''}
                    </div>
                  </div>

                  {result.data?.changes?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                        优化改动
                      </p>
                      <ul className="space-y-1">
                        {result.data.changes.map((c, i) => (
                          <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                            <span className="text-accent-purple/60 mt-1.5">•</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.data?.tips && (
                    <p className="text-xs text-yellow-400/60 bg-yellow-500/[0.04] border border-yellow-500/[0.08] rounded-lg p-3">
                      💡 {result.data.tips}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
