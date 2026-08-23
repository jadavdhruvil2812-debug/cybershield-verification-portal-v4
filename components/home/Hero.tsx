"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Info } from "lucide-react";

export default function Hero() {
  // --- Staggered Animation Physics ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <section className="relative w-full overflow-hidden">
      
      {/* Ambient Core Lighting */}
      <div className="absolute left-1/2 top-0 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-cyan-500/20 to-transparent blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center text-center"
        >
          
          {/* Tactical Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <ShieldCheck size={16} />
              AI-Powered Defense Network
            </span>
          </motion.div>

          {/* Primary Directive (Heading) */}
          <motion.h1 
            variants={itemVariants} 
            className="mt-8 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Verify Before <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              You Trust.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants} 
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg"
          >
            CyberShield intercepts modern threat vectors using deep heuristic analysis. Detect phishing nodes, malicious payloads, and sophisticated digital fraud in real-time.
          </motion.p>

          {/* Command Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link href="/verify" className="w-full sm:w-auto outline-none">
              <button className="group relative w-full overflow-hidden rounded-xl bg-cyan-500 px-8 py-4 text-sm font-bold text-black transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <div className="relative z-10 flex items-center justify-center gap-2">
                  Initialize Terminal
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </div>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:animate-shimmer group-hover:opacity-100" />
              </button>
            </Link>

            <Link href="/about" className="w-full sm:w-auto outline-none">
              <button className="group flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-sm font-bold text-white transition-all hover:border-cyan-500/50 hover:bg-zinc-800">
                <Info size={18} className="text-zinc-400 transition-colors group-hover:text-cyan-400" />
                Access Intel
              </button>
            </Link>
          </motion.div>

          {/* System Telemetry Indicator */}
          <motion.div 
            variants={itemVariants} 
            className="mt-16 flex items-center justify-center gap-3 rounded-2xl border border-white/[0.05] bg-zinc-900/40 px-6 py-3 backdrop-blur-xl shadow-2xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <p className="text-[11px] font-mono font-medium uppercase tracking-widest text-zinc-400">
              Threat Engine <span className="text-emerald-400 font-bold">v3.11</span> Online
            </p>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}