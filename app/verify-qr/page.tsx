"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Loader2,
  Terminal,
  X,
  ScanLine,
  Crosshair
} from "lucide-react";

type PredictionType = "SAFE" | "SUSPICIOUS" | "UNSAFE";

interface QRResult {
  success: boolean;
  status?: PredictionType;
  decoded_content?: string;
  recommendation?: string;
  message?: string;
}

export default function QRVerificationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<QRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
  };

  const clearSelection = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const normalizeStatus = (value?: string): PredictionType => {
    if (!value) return "SAFE";
    const val = value.toUpperCase().trim();
    if (["UNSAFE", "MALICIOUS", "HIGH", "SCAM"].includes(val)) return "UNSAFE";
    if (["SUSPICIOUS", "WARNING", "UNVERIFIABLE"].includes(val)) return "SUSPICIOUS";
    return "SAFE";
  };

  const analyzeQR = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Connects to local FastAPI backend endpoint
      const response = await fetch("http://127.0.0.1:8000/verify-qr", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok && !data.status) {
        setResult({
          success: false,
          message: data.detail || data.message || "Failed to decode and analyze QR payload.",
        });
        return;
      }

      setResult({
        success: data.success !== false,
        status: normalizeStatus(data.status || data.prediction),
        decoded_content: data.data || data.payload || data.decoded_content || "",
        recommendation: data.recommendation || "QR code analyzed successfully.",
        message: data.message,
      });
    } catch (error) {
      setResult({
        success: false,
        message: "Verification server unreachable. Ensure FastAPI backend is running on port 8000.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyles = (status?: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case "SAFE":
        return {
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: <ShieldCheck className="h-8 w-8 text-emerald-400" />
        };
      case "SUSPICIOUS":
        return {
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          icon: <AlertTriangle className="h-8 w-8 text-amber-400" />
        };
      case "UNSAFE":
      default:
        return {
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          icon: <ShieldAlert className="h-8 w-8 text-rose-500" />
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
            <QrCode className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            QR Payload <span className="text-cyan-400">Scanner</span>
          </h1>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto">
            Extract, decode, and analyze embedded QR code payloads for immediate threat classification.
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl"
        >
          <div className="rounded-[20px] bg-zinc-950/50 p-6 sm:p-8 border border-white/[0.02]">
            <AnimatePresence mode="wait">
              {!preview ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !loading && fileInputRef.current?.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/30 py-16 transition-all hover:border-cyan-500/50 hover:bg-zinc-900/80"
                >
                  <div className="mb-4 rounded-full bg-zinc-800/50 p-5 transition-colors group-hover:bg-cyan-500/10">
                    <ScanLine className="h-10 w-10 text-zinc-400 transition-colors group-hover:text-cyan-400" />
                  </div>
                  <p className="text-base font-semibold text-white">Initialize QR Code Upload</p>
                  <p className="mt-2 text-xs text-zinc-500 font-mono uppercase tracking-wider">PNG, JPG, WEBP • Max 10MB</p>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative flex flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-black/40 p-6"
                >
                  <button 
                    onClick={clearSelection}
                    className="absolute top-4 right-4 rounded-full bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                  <img
                    src={preview}
                    alt="QR Preview"
                    className="max-h-64 rounded-xl border border-white/[0.1] shadow-2xl object-contain"
                  />
                  <p className="mt-4 text-xs font-mono text-cyan-400 uppercase tracking-widest">{file?.name}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <button
              onClick={analyzeQR}
              disabled={!file || loading}
              className="group relative mt-6 w-full overflow-hidden rounded-xl bg-cyan-500 px-4 py-4 text-sm font-bold text-black transition-all hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Decrypting Payload...</>
                ) : (
                  <><Crosshair size={18} /> Execute Deep Scan</>
                )}
              </div>
            </button>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {result.success ? (
                (() => {
                  const styles = getVerdictStyles(result.status);
                  return (
                    <>
                      {/* Verdict Display */}
                      <div className={`rounded-[24px] border ${styles.border} ${styles.bg} p-6 sm:p-8 backdrop-blur-xl flex items-center justify-between gap-6`}>
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl bg-black/40 border ${styles.border}`}>
                            {styles.icon}
                          </div>
                          <div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">System Verdict</p>
                            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${styles.color}`}>
                              {result.status}
                            </h2>
                          </div>
                        </div>

                        <div className="hidden sm:block">
                          <span className={`text-xs font-bold px-4 py-2 rounded-full border uppercase tracking-wider ${styles.badge}`}>
                            {result.status === "SAFE" ? "Threat: None" : result.status === "SUSPICIOUS" ? "Threat: Moderate" : "Threat: Critical"}
                          </span>
                        </div>
                      </div>

                      {/* Decoded Content */}
                      <div className="rounded-[24px] border border-white/[0.05] bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl space-y-3">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                          <Terminal size={14} className="text-cyan-400" /> Decoded Payload
                        </h3>
                        <div className="rounded-xl bg-black/50 border border-white/[0.02] p-4 overflow-hidden">
                          <p className="text-sm font-mono text-cyan-400 break-all">
                            {result.decoded_content || "No text/URL content found in QR code."}
                          </p>
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div className="rounded-[24px] border border-cyan-500/20 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl space-y-2">
                        <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                          <ShieldCheck size={15} /> AI Directive
                        </h3>
                        <p className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed">
                          {result.recommendation}
                        </p>
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="flex items-center gap-4 rounded-[24px] border border-rose-500/20 bg-rose-500/10 p-6 sm:p-8 backdrop-blur-xl">
                  <div className="p-4 rounded-2xl bg-black/40 border border-rose-500/30 shrink-0">
                    <AlertTriangle className="h-8 w-8 text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-rose-400 mb-1">Scan Failed</h3>
                    <p className="text-sm text-rose-300/80">{result.message || "Unable to decode QR code."}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}