"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Moon,
  Lock,
  Trash2,
  LogOut,
  ChevronRight,
  Settings as SettingsIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
      router.push("/login");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-cyan-400 font-mono">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading telemetry...</span>
        </div>
      </div>
    );
  }

  const settingsCards = [
    { title: "Edit Profile", desc: "Update your operator handle and identity.", icon: User, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
    { title: "Change Password", desc: "Rotate your cryptographic credentials.", icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "Notifications", desc: "Configure threat broadcast channels.", icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "Appearance", desc: "Manage dark mode and command interface themes.", icon: Moon, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { title: "Privacy & Security", desc: "Hardening protocols and audit logs.", icon: Shield, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 selection:bg-cyan-500/30 pb-24">
      
      {/* Background Cyber-Grid */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[600px] -translate-y-1/2 rounded-full bg-cyan-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 pt-24 space-y-10">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <SettingsIcon size={14} /> Operator Control Panel
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            System <span className="text-cyan-400">Settings</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-400 font-mono">
            Logged in as <span className="text-cyan-400">{user.email || "Operator"}</span>
          </p>
        </motion.div>

        {/* Settings Modules */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {settingsCards.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group rounded-[20px] border border-white/[0.05] bg-zinc-900/40 p-1 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/30 hover:bg-zinc-900/60 shadow-xl"
              >
                <button className="flex w-full items-center justify-between p-6 rounded-[16px] bg-transparent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${item.border} ${item.bg} shadow-inner`}>
                      <Icon className={item.color} size={22} />
                    </div>
                    <div className="text-left">
                      <h2 className="font-bold text-white text-base tracking-tight">
                        {item.title}
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-zinc-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cyan-400" size={20} />
                </button>
              </div>
            );
          })}

          {/* Danger Zone: Delete Account */}
          <div className="rounded-[20px] border border-red-500/20 bg-red-500/5 p-1 backdrop-blur-xl shadow-xl">
            <button className="flex w-full items-center justify-between p-6 rounded-[16px] transition-colors hover:bg-red-500/10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 shadow-inner">
                  <Trash2 className="text-red-400" size={22} />
                </div>
                <div className="text-left">
                  <h2 className="font-bold text-red-400 text-base tracking-tight">
                    Purge Account
                  </h2>
                  <p className="text-xs text-red-300/80 mt-0.5">
                    Permanently delete your profile and telemetry records.
                  </p>
                </div>
              </div>
              <ChevronRight className="text-red-400/60 transition-transform duration-300 group-hover:translate-x-1" size={20} />
            </button>
          </div>

        </motion.div>

        {/* Footer Session Termination */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="pt-6 border-t border-white/[0.05]"
        >
          <Button
            onClick={logout}
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold shadow-lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Terminate Active Session
          </Button>
        </motion.div>

      </div>
    </div>
  );
}