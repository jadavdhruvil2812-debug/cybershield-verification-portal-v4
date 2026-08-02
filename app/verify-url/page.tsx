"use client";

import React, { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  Loader2,
  ServerCrash,
  Activity,
  Info,
  Link as LinkIcon,
} from "lucide-react";

interface VerificationResult {
  prediction: "SAFE" | "SUSPICIOUS" | "SCAM";
  confidence: number;
  risk: string;
  threat_score: number;
  reasons: string[];
  recommendation: string;
}

export default function VerifyUrlPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const validateUrl = (input: string) => {
    if (!input.trim()) {
      setError("Please enter a URL.");
      return false;
    }

    try {
      new URL(input);
      return true;
    } catch {
      setError("Please enter a valid URL.");
      return false;
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setResult(null);

    if (!validateUrl(url)) return;

    setLoading(true);

    try {
     const response = await fetch("http://127.0.0.1:8000/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend Error");
      }

      const data: VerificationResult = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to CyberShield Backend.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    SAFE: {
      text: "text-green-400",
      border: "border-green-500/30",
      bg: "bg-green-500/10",
      progress: "bg-green-500",
      icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
    },

    SUSPICIOUS: {
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      bg: "bg-yellow-500/10",
      progress: "bg-yellow-500",
      icon: <ShieldAlert className="w-6 h-6 text-yellow-400" />,
    },

    SCAM: {
      text: "text-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      progress: "bg-red-500",
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
    },
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
              {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex p-5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Shield className="w-12 h-12 text-cyan-400" />
          </div>

          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Website Verification
          </h1>

          <p className="text-slate-400 mt-4 text-lg">
            Verify suspicious websites before opening them.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.form
          onSubmit={handleVerify}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        >
          <div className="flex flex-col md:flex-row gap-4">

            <div className="flex-1 relative">
              <LinkIcon className="absolute left-4 top-4 w-5 h-5 text-slate-500" />

              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 transition font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Verify
                </>
              )}
            </button>

          </div>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-center gap-3"
            >
              <ServerCrash className="text-red-400 w-6 h-6" />
              <span className="text-red-300">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
                {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-10 rounded-2xl border p-8 ${
                styles[result.prediction].border
              } ${styles[result.prediction].bg}`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">

                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-slate-900">
                    {styles[result.prediction].icon}
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm">Prediction</p>

                    <h2
                      className={`text-3xl font-black ${styles[result.prediction].text}`}
                    >
                      {result.prediction}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">

                  <div>
                    <p className="text-slate-400 text-sm">Risk</p>
                    <h3 className="text-xl font-bold">{result.risk}</h3>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm">Confidence</p>
                    <h3 className="text-xl font-bold">
                      {result.confidence}%
                    </h3>
                  </div>

                </div>

              </div>

              {/* Threat Score */}

              <div className="mt-8">

                <div className="flex justify-between mb-2">

                  <span className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-4 h-4" />
                    Threat Score
                  </span>

                  <span className="font-bold">
                    {result.threat_score}/100
                  </span>

                </div>

                <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden">

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${result.threat_score}%`,
                    }}
                    transition={{ duration: 1 }}
                    className={`h-full ${styles[result.prediction].progress}`}
                  />

                </div>

              </div>

              {/* Reasons */}

              <div className="mt-8">

                <h3 className="flex items-center gap-2 font-semibold mb-4">
                  <Info className="w-4 h-4" />
                  Detection Reasons
                </h3>

                <div className="flex flex-wrap gap-3">

                  {result.reasons.map((reason, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm"
                    >
                      {reason}
                    </span>
                  ))}

                </div>

              </div>

              {/* Recommendation */}

              <div className="mt-8 rounded-xl bg-slate-900 border border-slate-700 p-5">

                <h3 className="font-semibold mb-2">
                  Recommendation
                </h3>

                <p className="text-slate-300">
                  {result.recommendation}
                </p>

              </div>
                          </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-slate-500 text-sm"
        >
          <p>
            Powered by{" "}
            <span className="font-semibold text-cyan-400">
              CyberShield AI
            </span>{" "}
            • Website Verification Engine
          </p>
        </motion.div>

      </div>
    </main>
  );
}