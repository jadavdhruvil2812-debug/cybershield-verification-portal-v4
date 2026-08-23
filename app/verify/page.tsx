"use client";

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  GlobeLock,
  Image as ImageIcon,
  QrCode,
  UploadCloud,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Crosshair,
} from "lucide-react";

type PredictionType = "SAFE" | "UNSAFE";
type VerificationTab = "sms" | "url" | "image" | "qr";

interface APIResponse {
  status?: string;
  prediction?: string;
  url?: string;
  error?: string;
  message?: string;
}

interface VerificationResult {
  status: PredictionType;
}

export default function VerifyPage() {
  const [activeTab, setActiveTab] = useState<VerificationTab>("sms");
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = useCallback((tab: VerificationTab) => {
    setActiveTab(tab);
    setTextInput("");
    setFileInput(null);
    setError(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleClear = () => {
    setTextInput("");
    setFileInput(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileInput(e.target.files[0]);
      setError(null);
    }
  };

  const validateInput = () => {
    if ((activeTab === "sms" || activeTab === "url") && !textInput.trim()) {
      setError(`Please provide ${activeTab.toUpperCase()} content for analysis.`);
      return false;
    }
    if ((activeTab === "image" || activeTab === "qr") && !fileInput) {
      setError("Please initialize a file upload for analysis.");
      return false;
    }
    return true;
  };

  const normalizeStatus = (value?: string): PredictionType => {
    const val = value?.toUpperCase().trim();
    if (val === "SAFE" || val === "CLEAN" || val === "LEGITIMATE") {
      return "SAFE";
    }
    return "UNSAFE";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endpoints: Record<VerificationTab, string> = {
        sms: "/api/verify/sms",
        url: "/api/verify/url",
        image: "/api/verify/image",
        qr: "/api/verify/qr",
      };

      let body: BodyInit;
      let headers: Record<string, string> = {};

      if (activeTab === "image" || activeTab === "qr") {
        const form = new FormData();
        form.append("file", fileInput as Blob);
        body = form;
      } else if (activeTab === "url") {
        body = JSON.stringify({ url: textInput.trim() });
        headers["Content-Type"] = "application/json";
      } else {
        body = JSON.stringify({ sms: textInput.trim() });
        headers["Content-Type"] = "application/json";
      }

      const response = await fetch(endpoints[activeTab], { method: "POST", headers, body });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned HTTP ${response.status}. Please check route and backend status.`);
      }

      const data: APIResponse = await response.json();

      if (!response.ok && !data.status) {
        throw new Error(data.message || data.error || "Threat verification protocol failed.");
      }

      const cleanStatus = normalizeStatus(data.status || data.prediction);

      setResult({
        status: cleanStatus,
      });
    } catch (err: any) {
      setError(err.message || "Terminal disconnected. Server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyles = (status: PredictionType) => {
    switch (status) {
      case "SAFE":
        return {
          color: "text-emerald-400",
          border: "border-emerald-500/30",
          bg: "bg-emerald-500/10",
          badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          icon: <ShieldCheck className="h-9 w-9 text-emerald-400" />,
        };
      case "UNSAFE":
      default:
        return {
          color: "text-rose-500",
          border: "border-rose-500/30",
          bg: "bg-rose-500/10",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/30",
          icon: <ShieldAlert className="h-9 w-9 text-rose-500" />,
        };
    }
  };

  const tabs = [
    { id: "sms", label: "SMS Intercept", icon: MessageSquare },
    { id: "url", label: "URL Scan", icon: GlobeLock },
    { id: "image", label: "Image Forensics", icon: ImageIcon },
    { id: "qr", label: "QR Decode", icon: QrCode },
  ] as const;

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-cyan-500/30 pb-24">
      {/* Background Cyber-Grid */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-24 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <Crosshair className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Threat <span className="text-cyan-400">Analysis Engine</span>
          </h1>
          <p className="mt-3 text-sm text-zinc-400 max-w-lg mx-auto">
            Analyze SMS text, URLs, and image payloads for immediate safety classification.
          </p>
        </div>

        {/* Input Interface */}
        <div className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-[20px] bg-zinc-950/50 overflow-hidden border border-white/[0.02]">
            {/* Segmented Tab Control */}
            <div className="flex p-2 gap-2 border-b border-white/[0.05] bg-zinc-900/30 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as VerificationTab)}
                    className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                      isActive ? "text-cyan-400" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 rounded-xl bg-cyan-500/10 border border-cyan-500/20"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon size={16} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Area */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* TEXT/URL INPUTS */}
                  {(activeTab === "sms" || activeTab === "url") && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                        {activeTab === "sms" ? "Intercepted Payload" : "Target Endpoint URL"}
                      </label>
                      {activeTab === "sms" ? (
                        <textarea
                          rows={5}
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Paste the message content here for verification..."
                          className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
                        />
                      ) : (
                        <input
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="https://suspicious-endpoint.net"
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-4 px-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
                        />
                      )}
                    </div>
                  )}

                  {/* FILE DROPZONE */}
                  {(activeTab === "image" || activeTab === "qr") && (
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                        Forensic Upload
                      </label>
                      <div
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/30 py-12 transition-all hover:border-cyan-500/50 hover:bg-zinc-900/80"
                      >
                        <div className="mb-4 rounded-full bg-zinc-800/50 p-4 transition-colors group-hover:bg-cyan-500/10">
                          <UploadCloud className="h-8 w-8 text-zinc-400 transition-colors group-hover:text-cyan-400" />
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {fileInput ? fileInput.name : "Initialize File Upload"}
                        </p>
                        <p className="mt-2 text-xs text-zinc-500 font-mono uppercase tracking-wider">
                          PNG, JPG, WEBP • Max 10MB
                        </p>
                        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileChange} />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex-1 overflow-hidden rounded-xl bg-cyan-500 px-4 py-4 text-sm font-bold text-black transition-all hover:bg-cyan-400 disabled:opacity-70 disabled:hover:bg-cyan-500"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Analyzing Threat Vectors...
                      </>
                    ) : (
                      <>
                        <Activity size={16} /> Execute Analysis
                      </>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-xl border border-zinc-700 bg-transparent px-8 py-4 text-sm font-bold text-white transition-all hover:bg-zinc-800"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-xl">
                <AlertTriangle size={18} className="shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Dashboard */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {(() => {
                const styles = getVerdictStyles(result.status);
                return (
                  <div
                    className={`rounded-[24px] border ${styles.border} ${styles.bg} p-6 sm:p-8 backdrop-blur-xl flex items-center justify-between gap-6`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-2xl bg-black/40 border ${styles.border}`}>
                        {styles.icon}
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">
                          System Verdict
                        </p>
                        <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${styles.color}`}>
                          {result.status}
                        </h2>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <span
                        className={`text-xs font-bold px-4 py-2 rounded-full border uppercase tracking-wider ${styles.badge}`}
                      >
                        {result.status === "SAFE" ? "Threat: None" : "Threat: High"}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}