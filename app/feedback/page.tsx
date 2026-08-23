"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  User, 
  Mail, 
  ChevronDown,
  Sparkles
} from "lucide-react";

export default function FeedbackPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "General",
    rating: 5,
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setRating = (rating: number) => {
    setForm({ ...form, rating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit telemetry.");
      }

      setSuccess("Transmission successful. Thank you for securing the grid.");
      setTimeout(() => setSuccess(""), 4000);

      setForm({
        name: "",
        email: "",
        category: "General",
        rating: 5,
        message: "",
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("System fault. Unable to establish connection.");
      }
      setTimeout(() => setError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  // --- Animation Variants ---
  // typed as any to avoid strict framer-motion Transition typing issues in TS
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
      
      {/* Background Cyber-Grid */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 opacity-[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 pt-24">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <MessageSquare className="h-8 w-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            Intelligence <span className="text-cyan-400">Feedback</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Submit bug reports, feature requests, or general system feedback to help improve the CyberShield terminal.
          </p>
        </div>

        {/* Feedback Form Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl"
        >
          <form onSubmit={handleSubmit} className="rounded-[20px] bg-zinc-900/40 p-6 md:p-8 space-y-6">
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Name Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                  Operator Name
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </motion.div>

              {/* Email Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                  Comm Link (Email)
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="operator@cybershield.io"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Category Field */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                  Report Classification
                </label>
                <div className="relative group">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-zinc-800 bg-zinc-950/50 py-3 pl-4 pr-10 text-sm text-white outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                  >
                    <option value="General">General Feedback</option>
                    <option value="Bug Report">System Bug / Error</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Security">Security Vulnerability</option>
                    <option value="UI/UX">Interface (UI/UX)</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-focus-within:text-cyan-400 transition-colors">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </motion.div>

              {/* Custom Star Rating */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                  System Rating
                </label>
                <div className="flex h-[46px] items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={22} 
                        className={`transition-colors duration-300 ${
                          form.rating >= star 
                            ? "text-cyan-400 fill-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                            : "text-zinc-700 fill-transparent"
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    {form.rating}/5
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Message Field */}
            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                Transmission Payload
              </label>
              <textarea
                rows={5}
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Detail your findings or requests here..."
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
              />
            </motion.div>

            {/* Alerts */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <p className="font-medium">{success}</p>
                  </div>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                    <AlertCircle size={18} className="shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-xl bg-cyan-500 px-4 py-4 text-sm font-bold text-black transition-all hover:bg-cyan-400 disabled:opacity-70 disabled:hover:bg-cyan-500"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Transmitting...
                    </>
                  ) : (
                    <>
                      Transmit Feedback
                      <Send size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </div>
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:animate-shimmer group-hover:opacity-100" />
              </button>
            </motion.div>

          </form>
        </motion.div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-zinc-500"
        >
          <Sparkles size={14} className="text-cyan-500/50" />
          All transmissions are encrypted and analyzed by the CyberShield team.
        </motion.div>
      </div>
    </div>
  );
}