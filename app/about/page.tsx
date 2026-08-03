export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-6 py-16">

        <h1 className="mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-5xl font-bold text-transparent">
          About CyberShield
        </h1>

        <p className="mb-10 text-lg text-slate-400">
          AI-Powered Cyber Security & Digital Safety Platform
        </p>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">

          <h2 className="mb-4 text-2xl font-semibold text-cyan-400">
            Our Mission
          </h2>

          <p className="mb-8 leading-8 text-slate-300">
            CyberShield is designed to protect users from modern cyber threats
            such as phishing websites, scam SMS, fake QR codes, malicious
            links, and digital fraud. Our goal is to provide fast, intelligent,
            and easy-to-use security tools powered by Artificial Intelligence.
          </p>

          <h2 className="mb-4 text-2xl font-semibold text-cyan-400">
            Key Features
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-xl border border-slate-700 p-5">
              📩 SMS Scam Detection
            </div>

            <div className="rounded-xl border border-slate-700 p-5">
              🌐 Website Verification
            </div>

            <div className="rounded-xl border border-slate-700 p-5">
              🔗 URL Reputation Analysis
            </div>

            <div className="rounded-xl border border-slate-700 p-5">
              📷 QR Code Safety Scanner
            </div>

            <div className="rounded-xl border border-slate-700 p-5">
              🖼️ AI Image Verification
            </div>

            <div className="rounded-xl border border-slate-700 p-5">
              🗺️ Cyber Attack Heatmap
            </div>

            <div className="rounded-xl border border-slate-700 p-5">
              📜 Verification History
            </div>

            <div className="rounded-xl border border-slate-700 p-5">
              🛡️ AI Threat Detection
            </div>

          </div>

          <h2 className="mt-10 mb-4 text-2xl font-semibold text-cyan-400">
            Technology Stack
          </h2>

          <div className="flex flex-wrap gap-3">

            <span className="rounded-full bg-cyan-500/20 px-4 py-2">
              Next.js
            </span>

            <span className="rounded-full bg-cyan-500/20 px-4 py-2">
              TypeScript
            </span>

            <span className="rounded-full bg-cyan-500/20 px-4 py-2">
              Tailwind CSS
            </span>

            <span className="rounded-full bg-cyan-500/20 px-4 py-2">
              FastAPI
            </span>

            <span className="rounded-full bg-cyan-500/20 px-4 py-2">
              MongoDB
            </span>

            <span className="rounded-full bg-cyan-500/20 px-4 py-2">
              AI / Machine Learning
            </span>

          </div>

          <div className="mt-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-6">

            <h3 className="mb-2 text-xl font-semibold text-cyan-300">
              Vision
            </h3>

            <p className="text-slate-300 leading-8">
              To create a secure digital environment where everyone can verify,
              detect, and stay protected against cyber threats using modern AI
              technology.
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}