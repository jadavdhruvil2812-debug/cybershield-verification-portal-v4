"use client";

import { motion } from "framer-motion";
import SectionTitle from "@/components/common/SectionTitle";
import { Activity, ShieldCheck, Zap, Database } from "lucide-react";

const stats = [
  {
    value: "50K+",
    label: "SMS Payloads Analyzed",
    icon: Database,
    accent: "text-cyan-400",
    glow: "group-hover:shadow-cyan-500/10",
  },
  {
    value: "12K+",
    label: "Threats Neutralized",
    icon: ShieldCheck,
    accent: "text-blue-400",
    glow: "group-hover:shadow-blue-500/10",
  },
  {
    value: "98.4%",
    label: "Heuristic Accuracy",
    icon: Activity,
    accent: "text-emerald-400",
    glow: "group-hover:shadow-emerald-500/10",
  },
  {
    value: "<200ms",
    label: "Gateway Latency",
    icon: Zap,
    accent: "text-amber-400",
    glow: "group-hover:shadow-amber-500/10",
  },
];

export default function Stats() {
  // --- Animation Physics ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
    },
  };

  return (
    <section className="relative w-full py-24">
      
      {/* Ambient Glow Element */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        <SectionTitle
          badge="Platform Telemetry"
          title="CyberShield At A Glance"
          subtitle="Real-time performance metrics and detection thresholds processed by our AI verification gateway."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.05] bg-zinc-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:bg-zinc-900/60 hover:shadow-2xl ${item.glow}`}
              >
                
                {/* Background Shimmer Effect on Hover */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 transition-opacity duration-500 group-hover:animate-shimmer group-hover:opacity-100" />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.05] bg-black/40 shadow-inner">
                    <Icon className={`h-6 w-6 ${item.accent}`} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    Live Stream
                  </span>
                </div>

                <div>
                  <h3 className={`text-4xl sm:text-5xl font-black tracking-tight ${item.accent} mb-2`}>
                    {item.value}
                  </h3>
                  <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    {item.label}
                  </p>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}