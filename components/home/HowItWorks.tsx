import SectionTitle from "@/components/common/SectionTitle";
import {
  MessageSquare,
  ScanSearch,
  Brain,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: <MessageSquare className="h-8 w-8 text-cyan-400" />,
    title: "1. Input SMS",
    desc: "Paste an SMS or upload a screenshot for analysis.",
  },
  {
    icon: <ScanSearch className="h-8 w-8 text-cyan-400" />,
    title: "2. OCR & Analysis",
    desc: "Screenshots are converted into text and suspicious patterns are extracted.",
  },
  {
    icon: <Brain className="h-8 w-8 text-cyan-400" />,
    title: "3. AI Verification",
    desc: "Our ML model analyzes phishing keywords, links, sender patterns and scam indicators.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-cyan-400" />,
    title: "4. Final Report",
    desc: "Receive Safe/Scam prediction, confidence score, threat score and recommendations.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          badge="WORKFLOW"
          title="How CyberShield Works"
          subtitle="Simple, fast and AI-powered verification in just a few seconds."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center transition hover:border-cyan-500"
            >
              <div className="mb-5 flex justify-center">
                {step.icon}
              </div>

              <h3 className="mb-3 text-xl font-semibold text-white">
                {step.title}
              </h3>

              <p className="text-slate-400">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}