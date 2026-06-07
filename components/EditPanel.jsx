'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Image as ImageIcon } from 'lucide-react';
import ShimmerButton from './ShimmerButton';
import { editPhoto } from '@/lib/api';
import UploadZone from './UploadZone';

export default function EditPanel({ open, onClose, hasVision = true, provider = '' }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFile = (f) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file || !instruction.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await editPhoto(file, instruction, provider || undefined);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const quickEdits = [
    '把背景换成星空夜景',
    '加上柔焦梦幻光斑效果',
    '调成黑白高级感大片',
    '换成秋天金黄色调',
    '增加赛博朋克霓虹灯光',
    '虚化背景突出主体',
  ];

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
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative glass-elevated rounded-2xl p-6 md:p-8
              w-full max-w-lg max-h-[85vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl
                hover:bg-white/[0.06] transition-colors duration-200"
            >
              <X size={18} className="text-muted" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan
                flex items-center justify-center">
                <Wand2 size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">智能修图</h2>
                <p className="text-xs text-muted-foreground">上传照片 + 描述需求，AI 生成修改效果</p>
              </div>
            </div>

            {/* Quick edit chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickEdits.map((q) => (
                <button
                  key={q}
                  onClick={() => setInstruction(q)}
                  className={`
                    px-3 py-1.5 rounded-full text-[11px] font-medium
                    transition-all duration-200
                    ${instruction === q
                      ? 'bg-accent/[0.12] border-accent/30 text-accent border'
                      : 'bg-white/[0.03] border border-white/[0.06] text-muted hover:border-white/[0.12]'
                    }
                  `}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Upload */}
            {!preview ? (
              <UploadZone onUpload={handleFile} hasVision={hasVision} />
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-white/[0.08]">
                  <img src={preview} alt="原图" className="w-full max-h-48 object-contain bg-black/40" />
                </div>

                <textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="描述你的修改需求..."
                  rows={2}
                  className="w-full p-4 rounded-xl text-sm
                    bg-white/[0.03] border border-white/[0.08]
                    text-white placeholder:text-muted-subtle
                    focus:outline-none focus:border-accent/30
                    resize-none transition-all duration-300"
                />

                <ShimmerButton
                  onClick={handleSubmit}
                  disabled={loading || !instruction.trim()}
                  className="w-full"
                >
                  {loading ? '生成中...' : '✨ 开始修图'}
                </ShimmerButton>

                {error && (
                  <p className="text-sm text-red-400/80 bg-red-500/[0.06] border border-red-500/[0.12] rounded-lg p-3">
                    {error}
                  </p>
                )}
              </div>
            )}

            {/* Result */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 space-y-4 overflow-hidden border-t border-white/[0.06] pt-4"
                >
                  {result.data?.generatedImage && (
                    <div>
                      <p className="text-[11px] font-medium text-accent-purple/70 uppercase tracking-wider mb-2">
                        生成效果
                      </p>
                      <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                        <img
                          src={result.data.generatedImage}
                          alt="AI 生成效果"
                          className="w-full object-contain bg-black/40"
                        />
                      </div>
                    </div>
                  )}

                  {result.data?.suggestion && (
                    <p className="text-sm text-white/70 leading-relaxed">
                      {result.data.suggestion}
                    </p>
                  )}

                  {result.data?.editPrompt && (
                    <p className="text-[11px] text-muted-subtle font-mono">
                      生图 Prompt: {result.data.editPrompt}
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
