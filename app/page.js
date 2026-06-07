'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Wand2, Sparkles, Copy, Check, Upload, Palette } from 'lucide-react';
import Header from '@/components/Header';
import CompareView from '@/components/CompareView';
import ShimmerButton from '@/components/ShimmerButton';
import FilterPanel from '@/components/FilterPanel';
import { fetchStatus, fetchProviders, coachPhoto, editPhoto, optimizePrompt } from '@/lib/api';

const TABS = [
  { id: 'coach', icon: Camera, label: '摄影教练' },
  { id: 'edit', icon: Wand2, label: '智能修图' },
  { id: 'filter', icon: Palette, label: '滤镜工坊' },
  { id: 'optimize', icon: Sparkles, label: 'Prompt 优化' },
];

// ==================== TabBar ====================
function TabBar({ active, onChange, disabledTabs = [] }) {
  return (
    <div className="flex justify-center px-4 pt-4">
      <div className="inline-flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-1 backdrop-blur-md">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const isDisabled = disabledTabs.includes(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onChange(tab.id)}
              disabled={isDisabled}
              className={`
                relative flex items-center gap-2 px-5 py-2.5 rounded-[10px]
                text-sm font-medium transition-all duration-300
                ${isDisabled
                  ? 'opacity-25 cursor-not-allowed text-white/30'
                  : isActive
                    ? 'text-white bg-accent shadow-[0_2px_12px_rgba(91,91,212,0.25)]'
                    : 'text-muted hover:text-white/80 hover:bg-white/[0.04]'
                }
              `}
            >
              <Icon size={16} strokeWidth={1.5} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== Coach Section ====================
function CoachSection({ hasVision, currentProvider }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const compareRef = useRef(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    setFile(f); setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await coachPhoto(file, currentProvider);
      setResult(res.data || res);
      setTimeout(() => compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (e) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); if (inputRef.current) inputRef.current.value = ''; };

  return (
    <div className="w-full space-y-6">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl mx-auto">
            <div
              role="button" tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click(); }}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`
                upload-dashed relative flex flex-col items-center justify-center
                min-h-[320px] p-12 cursor-pointer transition-all duration-500 group
                ${dragActive ? 'scale-[1.01]' : ''}
                ${!hasVision ? 'opacity-30 pointer-events-none' : ''}
              `}
            >
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(91,91,212,0.06) 0%, transparent 60%)' }} />
              <div className="relative mb-6 w-20 h-20 rounded-2xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06] transition-all duration-500 group-hover:border-accent/30 group-hover:shadow-[0_0_30px_rgba(91,91,212,0.1)]">
                <Upload size={32} className="transition-all duration-500 text-muted-foreground group-hover:text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-white/90 mb-2">{dragActive ? '释放以分析照片' : '上传照片，获取摄影分析'}</h3>
              <p className="text-sm text-muted">拖拽或点击选择你的摄影作品</p>
              <p className="text-xs text-muted-subtle mt-4">JPG / PNG / WebP · 最大 10MB</p>
              <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} className="hidden" />
            </div>
            {!hasVision && <p className="text-center text-xs text-red-400/60 mt-4">当前模型不支持视觉分析</p>}
          </motion.div>
        ) : (
          <motion.div key="preview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-5">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <img src={preview} alt="待分析" className="w-full max-h-[400px] object-contain bg-black/40" />
              <button onClick={reset} className="absolute top-4 right-4 px-4 py-2 text-xs font-medium rounded-lg bg-black/60 backdrop-blur-md border border-white/[0.12] text-white/70 hover:text-white transition-all duration-300">更换照片</button>
            </div>
            <ShimmerButton onClick={handleAnalyze} disabled={loading} className="w-full">
              <Sparkles size={18} /> {loading ? '分析中...' : '开始分析'}
            </ShimmerButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare View - slides in after analysis */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={compareRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <CompareView
              originalSrc={preview}
              result={result?.error
                ? `<p style="color:#f87171">❌ ${result.error}</p>`
                : (typeof result === 'string' ? result : result?.data)
              }
              show={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== Edit Section ====================
const QUICK_EDITS = ['把背景换成星空夜景', '柔焦梦幻光斑效果', '黑白高级感大片', '秋天金黄色调', '赛博朋克霓虹灯光'];

function EditSection({ hasVision, currentProvider }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const handleFile = (f) => { setFile(f); const r = new FileReader(); r.onload = (e) => setPreview(e.target.result); r.readAsDataURL(f); };

  const handleSubmit = async () => {
    if (!file || !instruction.trim()) return;
    setLoading(true); setError('');
    try { const res = await editPhoto(file, instruction, currentProvider); setResult(res); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Upload */}
      <div
        ref={dropRef} role="button" tabIndex={0}
        onClick={() => inputRef.current?.click()}
        className={`
          upload-dashed relative flex flex-col items-center justify-center
          min-h-[200px] p-8 cursor-pointer transition-all duration-300 group overflow-hidden
          ${preview ? 'p-3 min-h-0' : ''}
          ${!hasVision ? 'opacity-30 pointer-events-none' : ''}
        `}
      >
        {preview ? (
          <img src={preview} alt="原图" className="max-h-56 rounded-xl object-contain" />
        ) : (
          <>
            <Upload size={28} className="text-muted-foreground group-hover:text-accent transition-colors mb-3" strokeWidth={1.5} />
            <p className="text-sm text-muted">上传原始照片</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} className="hidden" />
      </div>

      {/* Quick edit chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_EDITS.map((q) => (
          <button key={q} onClick={() => setInstruction(q)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200
              ${instruction === q ? 'bg-accent/[0.12] border-accent/30 text-accent border' : 'bg-white/[0.03] border border-white/[0.06] text-muted hover:border-white/[0.12]'}`}>{q}</button>
        ))}
      </div>

      {/* Instruction input */}
      <textarea
        value={instruction} onChange={(e) => setInstruction(e.target.value)}
        placeholder="描述你的修改需求..."
        rows={2}
        className="w-full p-4 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-muted-subtle focus:outline-none focus:border-accent/30 resize-none transition-all duration-300"
      />

      <ShimmerButton onClick={handleSubmit} disabled={loading || !preview || !instruction.trim()} className="w-full">
        {loading ? '生成中...' : '✨ 开始修图'}
      </ShimmerButton>

      {error && <p className="text-sm text-red-400/80 bg-red-500/[0.06] border border-red-500/[0.12] rounded-lg p-3">{error}</p>}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 border-t border-white/[0.06] pt-5">
            {result.data?.genError && (
              <p className="text-sm text-yellow-400/80 bg-yellow-500/[0.06] border border-yellow-500/[0.12] rounded-lg p-3">
                ⚠️ 图片生成失败：{result.data.genError}
              </p>
            )}
            {result.data?.generatedImage && (
              <div>
                <p className="text-[11px] font-medium text-accent-purple/70 uppercase tracking-wider mb-2">生成效果</p>
                <div className="rounded-xl overflow-hidden border border-white/[0.08]">
                  <img src={result.data.generatedImage} alt="效果" className="w-full object-contain bg-black/40" />
                </div>
              </div>
            )}
            {result.data?.suggestion && <p className="text-sm text-white/70 leading-relaxed">{result.data.suggestion}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== Optimize Section ====================
function OptimizeSection({ currentProvider }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true); setError('');
    try { const res = await optimizePrompt(input, currentProvider); setResult(res); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => {
    if (result?.data?.optimized) { await navigator.clipboard.writeText(result.data.optimized); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <textarea
        value={input} onChange={(e) => setInput(e.target.value)}
        placeholder="输入你的原始 Prompt，例如：一只猫坐在窗边看日落..."
        rows={3}
        className="w-full p-5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-muted-subtle focus:outline-none focus:border-accent/30 focus:ring-1 focus:ring-accent/10 resize-none transition-all duration-300"
      />

      <ShimmerButton onClick={handleSubmit} disabled={loading || !input.trim()} className="w-full">
        <Sparkles size={18} /> {loading ? '优化中...' : '优化 Prompt'}
      </ShimmerButton>

      {error && <p className="text-sm text-red-400/80 bg-red-500/[0.06] border border-red-500/[0.12] rounded-lg p-3">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 border-t border-white/[0.06]">
            <div>
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">原始</p>
              <p className="text-sm text-white/50 bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">{result.data?.original || input}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-medium text-accent-cyan/70 uppercase tracking-wider">优化后（可直接复制使用）</p>
                <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] transition-all duration-200 ${copied ? 'bg-green-500/[0.1] text-green-400 border border-green-500/[0.2]' : 'bg-white/[0.03] text-muted border border-white/[0.06] hover:border-white/[0.12]'}`}>
                  {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? '已复制' : '复制'}
                </button>
              </div>
              <div className="bg-accent/[0.04] border border-accent/[0.1] rounded-xl p-4 text-sm text-white/80 leading-relaxed break-all">
                {result.data?.optimized || '(AI 未返回内容，请重试)'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== Main Page ====================
export default function Home() {
  const [status, setStatus] = useState(null);
  const [providers, setProviders] = useState([]);
  const [currentProvider, setCurrentProvider] = useState('');
  const [activeTab, setActiveTab] = useState('coach');
  const [initError, setInitError] = useState('');

  useEffect(() => {
    fetchProviders()
      .then((data) => {
        const list = data.providers || [];
        setProviders(list);

        if (list.length === 0) {
          setInitError('未检测到任何已配置的 AI 模型，请在 .env 中设置至少一个 API Key 后重启服务');
          return;
        }

        // 优先用配置的默认值（data.default），不在可用列表中则用第一个可用的
        const dp = list.find(p => p.id === data.default) ? data.default : (list[0]?.id || '');
        setCurrentProvider(dp);
        if (!dp) { setInitError('未检测到任何已配置的 AI 模型'); return; }
        return fetchStatus(dp);
      })
      .then((s) => { if (s) setStatus(s); })
      .catch((err) => {
        setInitError('无法连接到 AI 服务，请检查 API Key 配置和网络连接');
        setStatus({ features: [] });
      });
  }, []);

  const handleProviderChange = useCallback((np) => {
    setCurrentProvider(np);
    setInitError('');
    fetchStatus(np)
      .then(setStatus)
      .catch(() => {
        setInitError(`模型 "${np}" 连接失败，请检查对应的 API Key 是否有效`);
        setStatus({ features: [] });
      });
  }, []);

  const hasVision = status?.features?.includes?.('vision') ?? false;
  const hasImage = status?.features?.includes?.('image') ?? false;
  const noProvider = providers.length === 0 || !!initError;
  const disabledTabs = [];
  if (!hasVision || noProvider) disabledTabs.push('coach', 'edit');
  if (noProvider) disabledTabs.push('optimize');
  // filter 标签页纯前端运行，无需 AI，永远不禁用

  return (
    <main className="min-h-screen pb-24">
      <Header
        hasVision={hasVision && !noProvider}
        hasImage={hasImage && !noProvider}
        providers={providers}
        currentProvider={currentProvider}
        onProviderChange={handleProviderChange}
      />

      {/* Tab Bar */}
      <TabBar active={activeTab} onChange={setActiveTab} disabledTabs={disabledTabs} />

      {/* No provider warning */}
      {initError && (
        <div className="px-4 pt-6">
          <div className="max-w-2xl mx-auto bg-yellow-500/[0.06] border border-yellow-500/[0.15] rounded-xl p-5 text-center">
            <p className="text-yellow-400/80 text-sm font-medium mb-1">⚠️ 没有可用的 AI 模型</p>
            <p className="text-yellow-400/50 text-xs leading-relaxed">{initError}</p>
            <p className="text-muted-subtle text-[11px] mt-3">
              请编辑项目根目录下的 <code className="text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded">.env</code> 文件，配置至少一个 API Key 后重新启动服务
            </p>
          </div>
        </div>
      )}

      {/* Content Area */}
      <section className="px-4 pt-8">
        <AnimatePresence mode="wait">
          {activeTab === 'coach' && (
            <motion.div
              key="coach"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {noProvider ? (
                <EmptyState />
              ) : (
                <CoachSection hasVision={hasVision} currentProvider={currentProvider} />
              )}
            </motion.div>
          )}

          {activeTab === 'edit' && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {noProvider ? (
                <EmptyState />
              ) : (
                <EditSection hasVision={hasVision} currentProvider={currentProvider} />
              )}
            </motion.div>
          )}

          {activeTab === 'filter' && (
            <motion.div
              key="filter"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <FilterPanel />
            </motion.div>
          )}

          {activeTab === 'optimize' && (
            <motion.div
              key="optimize"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {noProvider ? (
                <EmptyState />
              ) : (
                <OptimizeSection currentProvider={currentProvider} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <footer className="text-center mt-20 mb-8">
        <p className="text-[11px] text-muted-subtle">SnapMaster · AI 摄影助手</p>
      </footer>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-subtle">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3 className="text-white/40 text-sm font-medium mb-2">当前没有可用的 AI 模型</h3>
      <p className="text-muted-subtle text-xs">请在 .env 中配置 API Key 后重启服务</p>
    </div>
  );
}
