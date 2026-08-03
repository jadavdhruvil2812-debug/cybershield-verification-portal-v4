"use client";

import React, { useState, ChangeEvent, DragEvent } from "react";

type PredictionResult = {
  prediction: string;
  confidence: number;
  threat_score: number;
  risk: string;
  reasons: string[];
  recommendation: string;
  sms?: string;
  extracted_text?: string;
};

export default function VerifyPage() {
  const [sms, setSms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const handleImageFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, JPEG, WEBP).");
      return;
    }

    setError("");
    setImage(file);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview("");
    setExtractedText("");
  };

  const clearAll = () => {
    setSms("");
    setResult(null);
    setError("");
    clearImage();
  };

  const verifySMS = async () => {
    if (!sms.trim()) {
      setError("Please enter an SMS to verify.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/verify-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sms }),
      });

     const data = await res.json();

if (!res.ok) {
  throw new Error(data.detail || data.message || "SMS verification failed.");
}

setResult(data);

// History me save karo
try {
  await fetch("/api/history", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "SMS",
      input: sms,
      result:
        data.prediction === "SAFE" ||
        data.prediction === "SCAM" ||
        data.prediction === "SUSPICIOUS"
          ? data.prediction
          : data.prediction === "Ham"
          ? "SAFE"
          : "SCAM",
      confidence: Number(data.confidence) || 0,
      details: data.explanation || "",
    }),
  });
} catch (err) {
  console.error("History Save Error:", err);
}
      await fetch("/api/history", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "SMS",
    input: sms,
    result: data.prediction,
    confidence: data.confidence,
    threatScore: data.threat_score,
    risk: data.risk,
  }),
});
    } catch (err: unknown) {
      console.error("SMS Verification Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unable to connect to AI Backend.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyImage = async () => {
    if (!image) {
      setError("Please select or drop an image screenshot.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setExtractedText("");

    try {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("http://127.0.0.1:8000/verify-image", {
  method: "POST",
  body: formData,
});
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Image OCR verification failed.");
      }

      const parsedText = data.extracted_text || data.sms || "";
      setExtractedText(parsedText);
      if (parsedText) {
        setSms(parsedText);
      }
      setResult(data);
      await fetch("/api/history", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "IMAGE",
    input: parsedText,
    result: data.prediction,
    confidence: data.confidence,
    threatScore: data.threat_score,
    risk: data.risk,
  }),
});
    } catch (err: unknown) {
      console.error("Image Verification Error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unable to connect to AI Backend.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (risk: string = "") => {
    const level = risk.toLowerCase();
    if (level.includes("high") || level.includes("critical") || level.includes("spam")) {
      return "bg-red-500/20 text-red-400 border-red-500/30";
    }
    if (level.includes("medium") || level.includes("warning") || level.includes("suspicious")) {
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400 backdrop-blur-md mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            AI Threat Detection Engine
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AI SMS & Image Verification
          </h1>
          <p className="mt-3 text-base text-slate-400 sm:text-lg max-w-2xl">
            Detect scams, phishing, and fraudulent content in text messages or screenshots.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content Area */}
          <section className="lg:col-span-12 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Text Input Panel */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-slate-700">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Manual SMS Input
                    </label>
                  </div>

                  <textarea
                    value={sms}
                    onChange={(e) => setSms(e.target.value)}
                    placeholder="Paste SMS here..."
                    className="h-44 w-full resize-none rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder-slate-500 transition focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={verifySMS}
                    disabled={loading || !sms.trim()}
                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      "Verify SMS"
                    )}
                  </button>
                  <button
                    onClick={clearAll}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Drag & Drop OCR Panel */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-slate-700">
                <div>
                  <label className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image / Screenshot
                  </label>

                  {!preview ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative flex h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition cursor-pointer ${
                        isDragging
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950/80"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        onChange={handleFileChange}
                        className="absolute inset-0 z-10 opacity-0 cursor-pointer"
                      />
                      <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-xs text-slate-300 font-medium">
                        Drag & drop image here, or <span className="text-cyan-400">browse</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        JPG, PNG, JPEG, WEBP
                      </p>
                    </div>
                  ) : (
                    <div className="relative h-44 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 flex items-center justify-center group">
                      <img
                        src={preview}
                        alt="Image Preview"
                        className="h-full w-full object-contain p-2"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 rounded-lg bg-slate-950/80 p-1.5 text-slate-400 backdrop-blur-md transition hover:bg-red-500 hover:text-white"
                        title="Remove Image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={verifyImage}
                    disabled={loading || !image}
                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Scanning OCR...
                      </span>
                    ) : (
                      "Verify Image"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            {/* Result Display Card */}
            {result && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Verification Result
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Analysis generated by AI security engine</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRiskBadgeColor(result.risk)}`}>
                    Risk Level: {result.risk || "Evaluated"}
                  </span>
                </div>

                {/* Grid Indicators */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-medium text-slate-400">Prediction</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-100 capitalize">
                      {result.prediction}
                    </h3>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-medium text-slate-400">Confidence</p>
                    <h3 className="mt-2 text-xl font-bold text-cyan-400">
                      {typeof result.confidence === "number" ? result.confidence.toFixed(1) : result.confidence}%
                    </h3>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-medium text-slate-400">Threat Score</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-100">
                      {result.threat_score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                    </h3>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <p className="text-xs font-medium text-slate-400">Risk</p>
                    <h3 className="mt-2 text-xl font-bold text-slate-100 uppercase text-xs tracking-wider">
                      {result.risk}
                    </h3>
                  </div>
                </div>

                {/* Extracted OCR Text */}
                {(extractedText || result.extracted_text) && (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Extracted OCR Text
                    </h3>
                    <p className="text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded-lg border border-slate-800/80 break-words">
                      {extractedText || result.extracted_text}
                    </p>
                  </div>
                )}

                {/* Detected Reasons */}
                {result.reasons && result.reasons.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-200">
                      Detected Reasons
                    </h3>
                    <ul className="grid gap-2">
                      {result.reasons.map((reason, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-xs text-slate-300"
                        >
                          <svg className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendation Banner */}
                {result.recommendation && (
                  <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                    <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                      Recommendation
                    </h3>
                    <p className="text-sm text-slate-300">
                      {result.recommendation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}