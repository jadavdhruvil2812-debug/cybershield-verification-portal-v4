"use client";

import Link from "next/link";
import { Shield, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.05] bg-[#09090b] text-slate-400 font-sans selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute left-1/2 bottom-0 -z-10 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-600/5 blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.05]">
          
          {/* Brand Info (Span 5) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 shadow-inner">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center">
                  Cyber<span className="text-cyan-400">Shield</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block">
                  AI Security Intelligence
                </span>
              </div>
            </Link>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              An enterprise-grade threat detection portal engineered to intercept phishing nodes, analyze malicious SMS payloads, and secure digital infrastructure in real-time.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Quick Links (Span 3) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Command Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/verify" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Threat Radar <ArrowUpRight size={12} className="opacity-60" />
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-cyan-400 transition-colors">
                  Security Logs
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-cyan-400 transition-colors">
                  Intelligence Feedback
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition-colors">
                  System Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication / Access (Span 4) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Operator Access
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Register for a secure clearance tier to access extended API rate limits and advanced telemetry logging.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link 
                href="/login" 
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:border-cyan-500/50 hover:bg-zinc-800"
              >
                Authenticate
              </Link>
              <Link 
                href="/signup" 
                className="rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-black transition-colors hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
              >
                Initialize Profile
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <p>© 2026 CyberShield Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-cyan-500" /> Secure SSL Gateway</span>
            <span>FastAPI Backend v3.11</span>
          </div>
        </div>

      </div>
    </footer>
  );
}