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
    icon: <Shield className="h-8 w-8 text-cyan-400" />,
    title: "Advanced Protection",
    desc: "Detect phishing messages, fake banking SMS and scam links instantly.",
  },
  {
    icon: <Brain className="h-8 w-8 text-cyan-400" />,
    title: "AI Powered",
    desc: "Machine Learning analyzes message patterns and predicts scams accurately.",
  },
  {
    icon: <ScanSearch className="h-8 w-8 text-cyan-400" />,
    title: "OCR Enabled",
    desc: "Upload SMS screenshots and automatically extract text for verification.",
  },
  {
    icon: <Lock className="h-8 w-8 text-cyan-400" />,
    title: "Privacy First",
    desc: "Messages are analyzed securely with user privacy as a priority.",
  },
  {
    icon: <Clock3 className="h-8 w-8 text-cyan-400" />,
    title: "Real-Time Analysis",
    desc: "Receive instant verification results within seconds.",
  },
  {
    icon: <BadgeCheck className="h-8 w-8 text-cyan-400" />,
    title: "Easy To Use",
    desc: "Simple interface designed for students, faculty and everyday users.",
  },
];

export default function WhyChoose() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          badge="WHY CHOOSE US"
          title="Why Choose CyberShield?"
          subtitle="Built to provide fast, accurate and practical cybersecurity assistance."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-8 transition hover:border-cyan-500"
            >
              <div className="mb-5">{item.icon}</div>

              <h3 className="mb-3 text-xl font-semibold text-white">
                {item.title}
              </h3>

              <p className="text-slate-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}