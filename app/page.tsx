"use client";

import { motion } from "framer-motion";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import WhyChoose from "@/components/home/WhyChoose";
import Stats from "@/components/home/Stats";
import CTA from "@/components/home/CTA";

export default function Home() {
  // Fluid entrance physics for each section as it scrolls into view
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7 } 
    }
  };

  return (
    <main className="relative min-h-screen bg-[#09090b] text-slate-200 overflow-hidden selection:bg-cyan-500/30">
      
      {/* 
        Global Cyber-Grid Background 
        This remains fixed in the background while the content scrolls over it, 
        tying the aesthetic of the FastAPI backend capabilities directly into the frontend.
      */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 left-1/2 -z-10 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-[20%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16">
        <Hero />
      </section>

      {/* Feature Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 border-t border-white/[0.03] bg-gradient-to-b from-white/[0.01] to-transparent py-20 sm:py-24"
      >
        <Features />
      </motion.section>

      {/* Working Process */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 border-t border-white/[0.03] py-20 sm:py-24"
      >
        <HowItWorks />
      </motion.section>

      {/* Why CyberShield */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 border-t border-white/[0.03] bg-gradient-to-b from-cyan-900/[0.02] to-transparent py-20 sm:py-24"
      >
        <WhyChoose />
      </motion.section>

      {/* Statistics */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 border-t border-white/[0.03] py-20 sm:py-24"
      >
        <Stats />
      </motion.section>

      {/* Call To Action */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={sectionVariants}
        className="relative z-10 border-t border-white/[0.03] bg-gradient-to-t from-cyan-950/20 to-transparent pt-20 sm:pt-24 pb-32"
      >
        <CTA />
      </motion.section>

    </main>
  );
}