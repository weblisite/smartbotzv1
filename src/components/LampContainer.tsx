'use client';

import { motion } from 'framer-motion';

export default function LampContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 w-full z-0">
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        {/* Lamp */}
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut',
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem]"
        >
          <div className="absolute inset-0 rotate-[70deg] bg-gradient-to-r from-cyan-500 via-transparent to-transparent" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          whileInView={{ opacity: 1, width: '30rem' }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut',
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] overflow-visible"
        >
          <div className="absolute inset-0 rotate-[290deg] bg-gradient-to-l from-cyan-500 via-transparent to-transparent" />
        </motion.div>

        {/* Glowing bar */}
        <motion.div
          initial={{ width: '8rem' }}
          whileInView={{ width: '16rem' }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: 'easeInOut',
          }}
          className="absolute inset-auto h-0.5 w-[16rem] bg-cyan-400 z-50"
        />

        {/* Glow effects */}
        <div className="absolute inset-auto z-30 h-36 w-[28rem] bg-cyan-500 opacity-50 blur-3xl" />
        <div className="absolute inset-auto z-40 h-36 w-64 bg-cyan-400 blur-2xl" />
        <div className="absolute inset-auto z-40 h-0.5 w-[30rem] bg-cyan-400 blur-sm" />

        {/* Content */}
        <div className="relative z-50 flex flex-col items-center px-5">
          {children}
        </div>
      </div>
    </div>
  );
} 