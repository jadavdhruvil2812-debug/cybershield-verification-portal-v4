"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  User, 
  Mail, 
  Key, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2,
  ArrowRight,
  UserPlus
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function getPasswordStrength(password: string) {
    if (!password) return { text: "", color: "bg-zinc-800", textCol: "text-zinc-500", width: "0%" };
    if (password.length < 6) return { text: "Weak", color: "bg-red-500", textCol: "text-red-400", width: "33%" };
    
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (strongRegex.test(password)) return { text: "Strong", color: "bg-emerald-500", textCol: "text-emerald-400", width: "100%" };
    
    return { text: "Medium", color: "bg-amber-500", textCol: "text-amber-400", width: "66%" };
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Security keys (passwords) do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Initialization failed. Please verify data.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Operative profile created successfully. Securing connection...");

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch {
      setError("Terminal connection failed. Please verify server status.");
    } finally {
      if (!success) setLoading(false);
    }
  }

  const strength = getPasswordStrength(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="relative min-h-screen bg-[#09090b] flex items-center justify-center p-4 sm:p-8 overflow-hidden selection:bg-cyan-500/30">
      
      {/* Background Cyber Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-[460px]"
      >
        <div className="rounded-[24px] border border-white/[0.08] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-2xl">
          <div className="rounded-[20px] bg-zinc-950/50 p-6 sm:p-8 border border-white/[0.02]">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative group mb-4">
                <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl transition-all group-hover:bg-cyan-400/40" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-black shadow-inner">
                  <UserPlus className="h-7 w-7 text-cyan-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Initialize Operative
              </h1>
              <p className="text-sm text-zinc-400 mt-2 font-mono uppercase tracking-wider">
                CyberShield Registration
              </p>
            </div>

            {/* Alert Messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400">
                    <AlertTriangle size={16} className="shrink-0" />
                    <p className="font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-400">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <p className="font-medium">{success}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                  Designation (Full Name)
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1">
                  Comm Link (Email)
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="operator@cybershield.io"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1 flex justify-between">
                  <span>Security Key</span>
                  {password && <span className={strength.textCol}>{strength.text}</span>}
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400">
                    <Key size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/50 focus:bg-black focus:ring-1 focus:ring-cyan-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Animated Strength Bar */}
                <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: strength.width }}
                    className={`h-full ${strength.color} transition-colors duration-300`} 
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 pl-1 flex justify-between">
                  <span>Verify Security Key</span>
                  {passwordsMatch && <span className="text-emerald-400">Match Verified</span>}
                  {passwordsMismatch && <span className="text-red-400">Mismatch Detected</span>}
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400">
                    <Shield size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`w-full rounded-xl border bg-zinc-900/50 py-3 pl-11 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:bg-black focus:ring-1 ${
                      passwordsMismatch 
                        ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50" 
                        : "border-zinc-800 focus:border-cyan-500/50 focus:ring-cyan-500/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading || success.length > 0}
                  className="group relative w-full overflow-hidden rounded-xl bg-cyan-500 px-4 py-3.5 text-sm font-bold text-black transition-all hover:bg-cyan-400 disabled:opacity-70 disabled:hover:bg-cyan-500"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating Profile...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle2 size={18} />
                        Initialized
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 -z-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:animate-shimmer group-hover:opacity-100" />
                </button>
              </div>
            </form>

            <div className="mt-8 text-center border-t border-white/[0.05] pt-6">
              <p className="text-xs text-zinc-500">
                Already hold an active clearance?{" "}
                <Link href="/login" className="text-cyan-500 hover:text-cyan-400 font-medium transition-colors">
                  Authenticate Here
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  );
}