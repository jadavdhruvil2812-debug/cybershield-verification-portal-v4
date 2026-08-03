"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Link2,
  QrCode,
  Mail,
  KeyRound,
  History,
} from "lucide-react";
import FeatureCard from "@/components/features/FeatureCard";
import SectionTitle from "@/components/common/SectionTitle";

const features = [
  {
    icon: <ShieldCheck className="h-7 w-7" />,
    title: "AI SMS Verification",
    description:
      "Paste any SMS or upload a screenshot. AI detects phishing, fake banking messages, scam links, and fraud attempts.",
    href: "/verify",
  },
  {
    icon: <Link2 className="h-7 w-7" />,
    title: "Link Safety Checker",
    description:
      "Analyze suspicious URLs and identify unsafe or phishing websites before opening them.",
    href: "/verify-url",
  },
  {
    icon: <QrCode className="h-7 w-7" />,
    title: "QR Code Scanner",
    description:
      "Scan QR codes securely and detect malicious links hidden inside QR codes.",
    href: "/verify-qr",
  },
  {
    icon: <Mail className="h-7 w-7" />,
    title: "Email Phishing Checker",
    description:
      "Detect suspicious emails using AI and identify common phishing indicators.",
    href: "#",
  },
  {
    icon: <KeyRound className="h-7 w-7" />,
    title: "Password Strength Analyzer",
    description:
      "Evaluate password strength and receive recommendations for stronger security.",
    href: "#",
  },
  {
    icon: <History className="h-7 w-7" />,
    title: "Scan History",
    description:
      "View your previous verification results and track all scanned messages securely.",
    href: "#",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          badge="FEATURES"
          title="Everything You Need To Stay Safe"
          subtitle="CyberShield provides multiple AI-powered cybersecurity tools designed for students and everyday users."
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              href={feature.href}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}