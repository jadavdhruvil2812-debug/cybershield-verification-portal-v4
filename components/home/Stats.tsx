import SectionTitle from "@/components/common/SectionTitle";

const stats = [
  {
    value: "50K+",
    label: "SMS Messages Analyzed",
  },
  {
    value: "12K+",
    label: "Scam Messages Detected",
  },
  {
    value: "98%",
    label: "Detection Accuracy",
  },
  {
    value: "<2 sec",
    label: "Average Scan Time",
  },
];

export default function Stats() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          badge="STATISTICS"
          title="CyberShield At A Glance"
          subtitle="Performance highlights of our AI-powered verification platform."
        />

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center transition hover:border-cyan-500"
            >
              <h3 className="text-5xl font-extrabold text-cyan-400">
                {item.value}
              </h3>

              <p className="mt-4 text-slate-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}