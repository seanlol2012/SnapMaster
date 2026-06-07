'use client';

import { motion } from 'framer-motion';

export default function ShimmerButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.01 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        relative group flex items-center justify-center gap-2
        px-8 py-3.5 rounded-xl font-semibold text-sm
        bg-accent text-white
        overflow-hidden
        transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed
        whitespace-nowrap
        ${className}
      `}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.3) 0%, transparent 70%)',
        }}
      />

      {/* Border beam - flowing edge highlight */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-0 w-[200%] h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 75%, transparent 100%)',
            transform: 'translateX(-100%)',
            animation: 'border-beam 3s ease-in-out infinite',
            '--beam-angle': '0deg',
          }}
        />
      </div>

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
