"use client";

import { motion, Variants } from "framer-motion";
import {
  ShieldCheck,
  Target,
  MessageSquareWarning,
  GlobeLock,
  Link as LinkIcon,
  QrCode,
  Image as ImageIcon,
  Map,
  History,
  Cpu,
  Terminal,
  Code2,
  Database,
  Network
} from "lucide-react";

export default function AboutPage() {
  // --- Animation Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 24 } 
    },
  };

  const features = [
    { name: "SMS Scam Detection", icon: MessageSquareWarning },
    { name: "Website Verification", icon: GlobeLock },
    { name: "URL Reputation Analysis", icon: LinkIcon },
    { name: "QR Code Safety Scanner", icon: QrCode },
    { name: "AI Image Verification", icon: ImageIcon },
    { name: "Cyber Attack Heatmap", icon: Map },
    { name: "Verification History", icon: History },
    { name: "AI Threat Detection", icon: Cpu },
  ];

  const techStack = [
    { name: "Next.js", icon: GlobeLock },
    { name: "TypeScript", icon: Code2 },
    { name: "Tailwind CSS", icon: Network },
    { name: "Python 3.11", icon: Terminal },
    { name: "FastAPI", icon: Cpu },
    { name: "MongoDB", icon: Database },
    { name: "Machine Learning", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-cyan-500/30 pb-24">
      
      {/* Background Cyber-Grid */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-24 space-y-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            System <span className="text-cyan-400">Intelligence</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 font-mono uppercase tracking-widest max-w-2xl mx-auto">
            AI-Powered Cyber Security & Digital Safety Platform
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          
          {/* Mission Statement Card */}
          <motion.div variants={itemVariants} className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl">
            <div className="rounded-[20px] bg-zinc-950/50 p-8 md:p-10 border border-white/[0.02]">
              <h2 className="flex items-center gap-3 text-xl font-bold text-white tracking-tight mb-6">
                <Target className="text-cyan-400" size={24} /> Operational Mission
              </h2>
              <p className="text-base leading-relaxed text-zinc-300">
                CyberShield is engineered to defend operators from modern digital threat vectors, including polymorphic phishing endpoints, malicious SMS payloads, deceptive QR codes, and generalized digital fraud. Our core directive is to deploy ultra-fast, intelligent, and seamless security tools powered by state-of-the-art Artificial Intelligence.
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Key Features Grid */}
            <motion.div variants={itemVariants} className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl h-full">
              <div className="rounded-[20px] bg-zinc-950/50 p-6 sm:p-8 border border-white/[0.02] h-full">
                <h2 className="flex items-center gap-3 text-lg font-bold text-white tracking-tight mb-6">
                  <Terminal className="text-cyan-400" size={20} /> Core Capabilities
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="group flex items-center gap-3 rounded-xl border border-white/[0.03] bg-black/40 p-3 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5">
                        <div className="rounded-lg bg-zinc-900 p-2 text-zinc-400 transition-colors group-hover:text-cyan-400">
                          <Icon size={16} />
                        </div>
                        <span className="text-xs font-semibold text-zinc-300">{feature.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Architecture / Tech Stack */}
            <div className="flex flex-col gap-6">
              
              <motion.div variants={itemVariants} className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl flex-1">
                <div className="rounded-[20px] bg-zinc-950/50 p-6 sm:p-8 border border-white/[0.02] h-full">
                  <h2 className="flex items-center gap-3 text-lg font-bold text-white tracking-tight mb-6">
                    <Database className="text-cyan-400" size={20} /> System Architecture
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, idx) => {
                      const Icon = tech.icon;
                      return (
                        <div key={idx} className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2 text-xs font-mono text-zinc-300">
                          <Icon size={14} className="text-cyan-500/70" />
                          {tech.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Vision Directive */}
              <motion.div variants={itemVariants} className="rounded-[24px] border border-cyan-500/20 bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl shadow-cyan-900/10">
                <div className="rounded-[20px] bg-cyan-500/5 p-6 border border-cyan-500/10">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">
                    <ShieldCheck size={16} /> Prime Directive (Vision)
                  </h3>
                  <p className="text-sm text-cyan-50/80 leading-relaxed">
                    To engineer an impenetrable digital ecosystem where users can instantly verify endpoints, detect anomalies, and remain shielded against rapidly evolving cyber threats utilizing decentralized intelligence.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}