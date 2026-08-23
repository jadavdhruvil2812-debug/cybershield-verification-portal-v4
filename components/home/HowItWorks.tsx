"use client";

import { motion, type Variants } from "framer-motion";
import SectionTitle from "@/components/common/SectionTitle";
import {
  MessageSquare,
  ScanSearch,
  Brain,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MessageSquare,
    title: "Payload Input",
    desc: "Paste suspicious SMS text, URLs, or upload forensic screenshots for analysis.",
  },
  {
    num: "02",
    icon: ScanSearch,
    title: "OCR & Extraction",
    desc: "Visual data undergoes OCR while text payloads are parsed for malicious syntax.",
  },
  {
    num: "03",
    icon: Brain,
    title: "AI Heuristics",
    desc: "Our ML model cross-references phishing keywords, routing links, and scam indicators.",
  },
  {
    num: "04",
    icon: ShieldCheck,
    title: "Threat Verdict",
    desc: "Receive an immediate threat score, confidence level, and actionable AI directive.",
  },
];

export default function HowItWorks() {
  // --- Animation Physics ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <section className="relative w-full py-24">
      
      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/4 rounded-full bg-cyan-600/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          badge="Operational Workflow"
          title="Analysis Pipeline"
          subtitle="A seamless, high-velocity verification protocol powered by artificial intelligence. Results delivered in milliseconds."
        />

        <div className="relative mt-16">
          
          {/* Connecting Data Line (Visible on Desktop) */}
          <div className="absolute left-[50%] top-[40px] hidden h-[1px] w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent lg:block" />
          
          {/* Animated Data Pulse on Line */}
          <motion.div
            initial={{ left: "10%", opacity: 0 }}
            animate={{ left: "90%", opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-[39px] hidden h-[3px] w-12 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)] lg:block"
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 sm:gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={itemVariants}
                  className="group relative flex flex-col rounded-[24px] border border-white/[0.05] bg-zinc-900/40 p-8 backdrop-blur-xl transition-all duration-500 hover:border-cyan-500/30 hover:bg-zinc-900/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                >
                  
                  {/* Step Number Background Watermark */}
                  <div className="absolute -right-2 top-2 z-0 text-7xl font-black text-white/[0.02] transition-colors duration-500 group-hover:text-cyan-500/[0.05]">
                    {step.num}
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-center sm:items-start sm:text-left">
                    
                    {/* Icon Container */}
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/20 bg-[#09090b] shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] lg:mx-auto">
                      <Icon className="h-8 w-8 text-cyan-400" />
                    </div>

                    <h3 className="mb-3 text-lg font-bold text-white tracking-tight">
                      <span className="text-cyan-500 mr-2 font-mono text-sm">{step.num}.</span>
                      {step.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
                      {step.desc}
                    </p>

                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}