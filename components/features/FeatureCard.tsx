"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
};

export default function FeatureCard({ icon, title, description, href }: Props) {
  return (
    <Link href={href} className="block w-full h-full outline-none">
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[24px] border border-white/[0.05] bg-zinc-900/40 p-8 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-500/30 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-cyan-900/20"
      >
        
        {/* Cyber Spotlight Glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Animated Shimmer Effect */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 transition-opacity duration-500 group-hover:animate-shimmer group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col">
          
          {/* Icon Module */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[16px] border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            {icon}
          </div>

          {/* Title & Description */}
          <h3 className="mb-3 text-xl font-bold text-white tracking-tight">
            {title}
          </h3>
          <p className="mb-8 flex-1 text-sm leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300">
            {description}
          </p>

          {/* Action Indicator */}
          <div className="mt-auto flex items-center gap-2 text-cyan-400/80 transition-colors group-hover:text-cyan-400">
            <span className="text-[11px] font-bold uppercase tracking-widest">
              Access Module
            </span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>
          
        </div>
      </motion.div>
    </Link>
  );
}