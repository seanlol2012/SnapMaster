'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Sparkles } from 'lucide-react';
import ShimmerButton from './ShimmerButton';

export default function UploadZone({ onUpload, disabled, hasVision = true }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleAnalyze = () => {
    if (file && onUpload) onUpload(file);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          /* ====== Upload State ====== */
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                upload-dashed relative
                flex flex-col items-center justify-center
                min-h-[340px] p-12 cursor-pointer
                transition-all duration-500
                group
                ${dragActive
                  ? 'scale-[1.01]'
                  : ''
                }
                ${!hasVision ? 'opacity-30 pointer-events-none' : ''}
              `}
            >
              {/* Ambient background glow on hover */}
              <div className={`
                absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100
                transition-opacity duration-700 pointer-events-none
              `}
                style={{
                  background: 'radial-gradient(ellipse at 50% 30%, rgba(91,91,212,0.08) 0%, transparent 60%)',
                }}
              />

              {/* Icon ring */}
              <div className={`
                relative mb-6 w-20 h-20 rounded-2xl
                flex items-center justify-center
                bg-white/[0.03] border border-white/[0.06]
                transition-all duration-500
                group-hover:border-accent/30 group-hover:bg-accent/[0.06]
                group-hover:shadow-[0_0_30px_rgba(91,91,212,0.1)]
              `}>
                <Upload
                  size={32}
                  className={`
                    transition-all duration-500
                    text-muted-foreground group-hover:text-accent
                    ${dragActive ? 'scale-110' : ''}
                  `}
                  strokeWidth={1.5}
                />
              </div>

              {/* Text */}
              <h3 className="text-lg font-medium text-white/90 mb-2 transition-colors duration-300 group-hover:text-white">
                {dragActive ? '释放以上传照片' : '拖拽照片到此处'}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                或点击选择文件
              </p>
              <p className="text-xs text-muted-subtle mt-4">
                支持 JPG / PNG / WebP · 最大 10MB
              </p>

              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleChange}
                className="hidden"
              />
            </div>

            {!hasVision && (
              <p className="text-center text-xs text-red-400/60 mt-4">
                当前模型不支持视觉分析，请切换到支持视觉的模型
              </p>
            )}
          </motion.div>

        ) : (
          /* ====== Preview State ====== */
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Preview image */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <img
                src={preview}
                alt="待分析照片"
                className="w-full max-h-[420px] object-contain bg-black/40"
              />
              {/* Replace button overlay */}
              <button
                onClick={reset}
                className="absolute top-4 right-4 px-4 py-2 text-xs font-medium
                  rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.12]
                  text-white/70 hover:text-white hover:border-white/[0.2]
                  transition-all duration-300"
              >
                更换照片
              </button>
            </div>

            {/* Analyze CTA */}
            <ShimmerButton onClick={handleAnalyze} disabled={disabled} className="w-full">
              <Sparkles size={18} strokeWidth={1.5} />
              {disabled ? '正在分析中...' : '上传并分析'}
            </ShimmerButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
