import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-12 text-center">

        <h2 className="text-4xl font-bold text-white">
          Ready To Verify Your SMS?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Protect yourself from phishing attacks, fake banking messages,
          malicious links and online scams using AI-powered verification.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/verify"
            className="rounded-lg bg-cyan-500 px-8 py-4 font-semibold text-black transition hover:bg-cyan-400"
          >
            Verify SMS
          </Link>

          <Link
            href="/signup"
            className="rounded-lg border border-slate-600 px-8 py-4 text-white transition hover:border-cyan-500"
          >
            Create Account
          </Link>
        </div>

      </div>
    </section>
  );
}