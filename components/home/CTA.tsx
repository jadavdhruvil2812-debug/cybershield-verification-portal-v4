"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldAlert, ArrowRight, UserPlus, Terminal } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative px-4 sm:px-6 w-full">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-zinc-950/80 p-10 sm:p-16 shadow-2xl backdrop-blur-2xl text-center"
        >
          
          {/* Ambient Core Glow */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-600/20 blur-[80px]" />
          
          {/* Background Grid Pattern inside CTA */}
          <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_14px]" />

          {/* Icon Badge */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <ShieldAlert size={32} />
          </div>

          {/* Headers */}
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Secure Your <span className="text-cyan-400">Digital Perimeter</span>
          </h2>
          
          <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-zinc-400 mb-10">
            Deploy enterprise-grade AI to detect phishing endpoints, malicious SMS payloads, and sophisticated fraud attempts in real-time. Do not leave your network vulnerable.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            
            {/* Primary Action */}
            <Link href="/verify" className="w-full sm:w-auto outline-none">
              <button className="group relative w-full overflow-hidden rounded-xl bg-cyan-500 px-8 py-4 text-sm font-bold text-black transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <Terminal size={18} />
                  Initialize Scan
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </div>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:animate-shimmer group-hover:opacity-100" />
              </button>
            </Link>

            {/* Secondary Action */}
            <Link href="/signup" className="w-full sm:w-auto outline-none">
              <button className="group flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 text-sm font-bold text-white transition-all hover:border-cyan-500/50 hover:bg-zinc-800">
                <UserPlus size={18} className="text-zinc-400 transition-colors group-hover:text-cyan-400" />
                Register Clearance
              </button>
            </Link>

          </div>

          {/* Footer Terminal Note */}
          <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Ready for Deployment
          </div>

        </motion.div>
      </div>
    </section>
  );
}