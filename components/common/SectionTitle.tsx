"use client";

import { motion } from "framer-motion";

type Props = {
  badge?: string;
  title: string;
  subtitle: string;
};

export default function SectionTitle({ badge, title, subtitle }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto mb-16 flex max-w-3xl flex-col items-center text-center px-4"
    >
      
      {/* System Status Badge */}
      {badge && (
        <div className="mb-6 flex items-center gap-2.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          {/* Pulsing Radar Dot */}
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
          </span>
          {badge}
        </div>
      )}

      {/* Primary Heading */}
      <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
        {title}
      </h2>

      {/* Subtitle / Description */}
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
        {subtitle}
      </p>
      
    </motion.div>
  );
}