"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Link2,
  QrCode,
  ScanSearch,
  History,
  FileSearch,
} from "lucide-react";

import FeatureCard from "@/components/features/FeatureCard";
import SectionTitle from "@/components/common/SectionTitle";

const features = [
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: "AI Threat Verification",
    description:
      "Verify SMS, URLs, QR codes and images using AI-based threat detection, rule engines, and risk analysis.",
    href: "/verify",
  },
  {
    icon: <Link2 className="h-7 w-7" />,
    title: "URL Security Analysis",
    description:
      "Analyze suspicious links and detect polymorphic phishing endpoints before establishing a connection.",
    href: "/verify",
  },
  {
    icon: <QrCode className="h-7 w-7" />,
    title: "QR Code Protection",
    description:
      "Upload QR images to extract and neutralize malicious routing hidden within the matrix data.",
    href: "/verify",
  },
  {
    icon: <FileSearch className="h-7 w-7" />,
    title: "OCR Image Verification",
    description:
      "Extract text payloads from screenshots and images to detect scam messaging via heuristic scanning.",
    href: "/verify",
  },
  {
    icon: <ScanSearch className="h-7 w-7" />,
    title: "AI Risk Assessment",
    description:
      "Generate detailed threat scores, confidence levels, matched security rules, and AI directives.",
    href: "/verify",
  },
  {
    icon: <History className="h-7 w-7" />,
    title: "Verification History",
    description:
      "Track previous security checks and maintain a secure audit log of all intercepted threats.",
    href: "/history",
  },
];

export default function Features() {
  // --- Staggered Animation Physics ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 } 
    },
  };

  return (
    <section className="relative w-full py-24">
      
      {/* Ambient Background Lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-600/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        <SectionTitle
          badge="System Capabilities"
          title="AI-Powered Digital Safety"
          subtitle="A unified intelligence portal engineered to detect scams, intercept phishing attempts, and neutralize malicious digital content in real-time."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants} className="h-full">
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                href={feature.href}
              />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}