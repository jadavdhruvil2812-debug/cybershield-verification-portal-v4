"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import SectionTitle from "@/components/common/SectionTitle";
import {
  Shield,
  Brain,
  Lock,
  Clock3,
  ScanSearch,
  BadgeCheck,
} from "lucide-react";

const items = [
  {
    icon: Shield,
    title: "Advanced Protection",
    desc: "Intercept phishing endpoints, fraudulent banking vectors, and scam URLs instantly.",
  },
  {
    icon: Brain,
    title: "AI-Powered Heuristics",
    desc: "Machine learning models analyze syntactic messaging patterns to predict anomalies with maximum precision.",
  },
  {
    icon: ScanSearch,
    title: "OCR Enabled",
    desc: "Upload screenshots to extract embedded text vectors automatically for optical verification.",
  },
  {
    icon: Lock,
    title: "Privacy First Architecture",
    desc: "Payloads and telemetry logs are processed securely with strict adherence to user data confidentiality.",
  },
  {
    icon: Clock3,
    title: "Real-Time Execution",
    desc: "Receive instant threat verdicts and heuristic metrics in milliseconds.",
  },
  {
    icon: BadgeCheck,
    title: "Operator Friendly",
    desc: "Streamlined command interface optimized for rapid response by both professionals and everyday users.",
  },
];

export default function WhyChoose() {
  // --- Animation Physics ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <section className="relative w-full py-24">
      
      {/* Ambient Glow Element */}
      <div className="pointer-events-none absolute right-1/4 top-1/2 -z-10 h-[500px] w-[600px] -translate-y-1/2 rounded-full bg-cyan-600/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        <SectionTitle
          badge="Strategic Advantages"
          title="Why Choose CyberShield?"
          subtitle="Engineered to provide high-velocity, mathematically accurate, and practical cybersecurity intelligence."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.05] bg-zinc-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:bg-zinc-900/60 hover:shadow-2xl hover:shadow-cyan-900/20"
              >
                
                {/* Background Shimmer Effect on Hover */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(6,182,212,0.05)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 transition-opacity duration-500 group-hover:animate-shimmer group-hover:opacity-100" />

                <div>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[16px] border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <Icon className="h-7 w-7" />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-white tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-8 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500 group-hover:text-cyan-400 transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  Verified Module
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}