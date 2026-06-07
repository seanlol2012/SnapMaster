'use client';

import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : {}}
      className={`
        glass rounded-2xl p-6
        transition-all duration-300
        ${hover ? 'hover:border-white/[0.14] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)_inset]' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
