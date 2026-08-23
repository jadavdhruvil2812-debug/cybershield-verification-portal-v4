"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GlobeLock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Terminal,
  ExternalLink,
  SearchCode,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type ThreatStatus = "Safe" | "Suspicious" | "Unsafe";

interface URLAnalysisResult {
  success: boolean;
  status: ThreatStatus;
  score: number;
  url: string;
  recommendation: string;
  message?: string;
}

export default function VerifyURLPage() {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<URLAnalysisResult | null>(null);

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = urlInput.trim();
    if (!cleanUrl) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/verify-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await res.json();

      setResult({
        success: data.success !== false,
        status: data.status || "Suspicious",
        score: data.score ?? (data.status === "Unsafe" ? 85 : 0),
        url: data.url || cleanUrl,
        recommendation:
          data.recommendation || "URL security inspection completed.",
        message: data.message,
      });
    } catch (err) {
      setResult({
        success: false,
        status: "Suspicious",
        score: 50,
        url: cleanUrl,
        recommendation:
          "Unable to establish connection to the URL verification engine.",
        message: "Network proxy failure.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyles = (status: ThreatStatus) => {
    switch (status) {
      case "Safe":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: <ShieldCheck className="h-8 w-8 text-emerald-400" />,
        };
      case "Suspicious":
        return {
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: <AlertTriangle className="h-8 w-8 text-amber-400" />,
        };
      case "Unsafe":
      default:
        return {
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          icon: <ShieldAlert className="h-8 w-8 text-rose-500" />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-cyan-500/30 pb-24">
      {/* Background Cyber-Grid */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-24 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <GlobeLock className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            URL Threat <span className="text-cyan-400">Intelligence</span>
          </h1>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto">
            Inspect untrusted domains, phishing redirects, and spoofed bank portals in real time.
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl"
        >
          <form
            onSubmit={handleAnalyze}
            className="rounded-[20px] bg-zinc-950/50 p-6 sm:p-8 border border-white/[0.02] space-y-4"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Enter URL to inspect (e.g. https://secure-bank-login.com or bit.ly/claim)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-4 pl-4 pr-12 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-cyan-500/40 focus:bg-zinc-900"
              />
              <ExternalLink className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={!urlInput.trim() || loading}
              className="group relative w-full overflow-hidden rounded-xl bg-cyan-500 px-4 py-4 text-sm font-bold text-black transition-all hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Querying Intelligence Engine...
                  </>
                ) : (
                  <>
                    <SearchCode size={18} /> Run Domain Inspection
                  </>
                )}
              </div>
            </button>
          </form>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {(() => {
                const styles = getStatusStyles(result.status);
                return (
                  <>
                    {/* Primary Verdict Card */}
                    <div
                      className={`rounded-[24px] border ${styles.border} ${styles.bg} p-6 sm:p-8 backdrop-blur-xl flex items-center justify-between gap-6`}
                    >
                      <div className="flex items-center gap-5">
                        <div
                          className={`p-4 rounded-2xl bg-black/40 border ${styles.border}`}
                        >
                          {styles.icon}
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">
                            Domain Reputation Status
                          </p>
                          <h2
                            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${styles.color}`}
                          >
                            {result.status.toUpperCase()}
                          </h2>
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span
                          className={`text-xs font-bold px-4 py-2 rounded-full border uppercase tracking-wider ${styles.badge}`}
                        >
                          Threat Score: {result.score}/100
                        </span>
                      </div>
                    </div>

                    {/* Inspected Target Payload */}
                    <div className="rounded-[24px] border border-white/[0.05] bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl space-y-3">
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={14} className="text-cyan-400" /> Target Domain
                      </h3>
                      <div className="rounded-xl bg-black/50 border border-white/[0.02] p-4 overflow-hidden">
                        <p className="text-sm font-mono text-cyan-400 break-all">
                          {result.url}
                        </p>
                      </div>
                    </div>

                    {/* AI Security Recommendation */}
                    <div className="rounded-[24px] border border-cyan-500/20 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl space-y-2">
                      <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck size={15} /> AI Security Directive
                      </h3>
                      <p className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed">
                        {result.recommendation}
                      </p>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}