"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  History,
  ScanSearch,
  MessageSquare,
  Settings,
  LogOut,
  Activity,
  Cpu,
  GlobeLock,
  ChevronRight,
  TerminalSquare,
  Server,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      console.error("Session parse error");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  // Staggered Animation Configurations
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-cyan-500 animate-spin" />
          <ShieldCheck className="h-5 w-5 text-cyan-500 animate-pulse" />
        </div>
        <p className="text-cyan-500/80 text-sm font-mono tracking-widest uppercase animate-pulse">
          Decrypting Session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Cyber-Grid Background Engine */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500 opacity-[0.07] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          
          {/* Identity & Status Header */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
            
            {/* Operator ID Card */}
            <div className="lg:col-span-2 rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[20px] bg-zinc-900/40 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 h-full">
                <div className="relative group shrink-0">
                  <div className="absolute inset-0 rounded-[2rem] bg-cyan-500/20 blur-xl transition-all group-hover:bg-cyan-400/30" />
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-zinc-700/50 bg-black text-5xl font-bold shadow-inner overflow-hidden">
                    <span className="bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent relative z-10">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {user.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400 font-mono">
                    <span className="flex items-center gap-1.5"><Mail size={14} className="text-cyan-500" /> {user.email}</span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wide">
                      <ShieldCheck size={14} />
                      {user.role || "Operator"}
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Session Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Connection Status (Tailored for Backend Devs) */}
            <div className="rounded-[24px] border border-white/[0.05] bg-[#09090b]/80 p-1 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[20px] bg-zinc-900/40 p-6 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Server size={16} className="text-blue-400" /> System Status
                  </h3>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                      <span className="text-zinc-500">FastAPI Gateway</span>
                      <span className="text-emerald-400 flex items-center gap-1.5"><Zap size={12}/> Online (v3.11)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/[0.05] pb-2">
                      <span className="text-zinc-500">Threat Intel DB</span>
                      <span className="text-emerald-400">Synced</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Access Level</span>
                      <span className="text-cyan-400">Root / Admin</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={logout}
                  variant="outline"
                  className="w-full mt-6 bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Terminate Connection
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Telemetry Metrics */}
          <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Verifications", value: "24", icon: ScanSearch, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "group-hover:border-cyan-500/30", sub: "URLs & Files" },
              { label: "Security Score", value: "98%", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "group-hover:border-emerald-500/30", sub: "Excellent" },
              { label: "Threats Blocked", value: "7", icon: Activity, color: "text-purple-400", bg: "bg-purple-400/10", border: "group-hover:border-purple-500/30", sub: "Malware Mitigated" },
              { label: "Node Latency", value: "12ms", icon: GlobeLock, color: "text-amber-400", bg: "bg-amber-400/10", border: "group-hover:border-amber-500/30", sub: "US-East-1" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className={`group rounded-[20px] border border-white/[0.05] bg-zinc-900/40 p-5 transition-colors ${stat.border}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${stat.bg} ${stat.color}`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white tracking-tight mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-zinc-300">{stat.label}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase tracking-wider">{stat.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Command Modules (Quick Actions) */}
          <motion.div variants={itemVariants} className="mt-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <TerminalSquare size={20} className="text-cyan-500" />
              Command Modules
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Run Scan", desc: "Analyze URLs and payloads", href: "/verify", icon: ScanSearch, accent: "cyan" },
                { title: "Audit Logs", desc: "Review detection history", href: "/history", icon: History, accent: "emerald" },
                { title: "Intel Report", desc: "Submit false positives", href: "/feedback", icon: MessageSquare, accent: "purple" },
                { title: "Configuration", desc: "System parameters", href: "/settings", icon: Settings, accent: "amber" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.title}
                    variant="ghost"
                    onClick={() => router.push(action.href)}
                    className="group relative flex h-auto flex-col items-start justify-start overflow-hidden rounded-[20px] border border-white/[0.05] bg-zinc-900/40 p-6 hover:bg-zinc-800/60 transition-all hover:scale-[1.02]"
                  >
                    <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-${action.accent}-500/10 blur-2xl transition-all group-hover:bg-${action.accent}-500/20`} />
                    <Icon size={24} className={`mb-4 text-${action.accent}-400 relative z-10`} />
                    <h3 className="text-base font-semibold text-white relative z-10">{action.title}</h3>
                    <p className="mt-1 text-xs text-zinc-400 font-normal relative z-10">{action.desc}</p>
                    <ChevronRight size={16} className={`absolute bottom-6 right-6 text-${action.accent}-500/0 transition-all group-hover:text-${action.accent}-500/100 group-hover:translate-x-1`} />
                  </Button>
                );
              })}
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}