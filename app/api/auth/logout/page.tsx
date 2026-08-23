"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Purge local storage credentials and session state
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login after a brief terminal termination effect
    const timer = setTimeout(() => {
      router.push("/login");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4 text-slate-200">
      
      {/* Cyber-Grid Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 p-8 rounded-3xl border border-white/[0.05] bg-zinc-900/40 backdrop-blur-xl shadow-2xl">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-inner">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Terminating Session...
          </h2>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            Purging cryptographic tokens & telemetry
          </p>
        </div>
      </div>
      
    </div>
  );
}