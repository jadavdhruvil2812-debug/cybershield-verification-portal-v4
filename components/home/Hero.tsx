export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
          AI Powered SMS Verification
        </span>

        <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-white md:text-7xl">
          Verify Every SMS
          <br />
          Before You Trust It.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-400">
          Detect phishing, fake banking messages, scam links and suspicious
          SMS using Artificial Intelligence.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="/verify"
            className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
          >
            Verify SMS
          </a>

          <a
            href="/about"
            className="rounded-lg border border-slate-700 px-6 py-3 text-white transition hover:border-cyan-500"
          >
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
}