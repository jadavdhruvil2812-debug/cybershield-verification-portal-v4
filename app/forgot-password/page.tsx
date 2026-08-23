"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  ShieldAlert,
  ShieldCheck,
  Shield,
  GlobeLock,
  MessageSquare,
  FileCode2,
  CalendarClock,
  ArrowRight,
  Filter,
  MoreVertical,
  Loader2
} from "lucide-react";

// --- Types ---
type ThreatLevel = "SAFE" | "SUSPICIOUS" | "MALICIOUS";
type ScanType = "URL" | "SMS" | "FILE";

interface SecurityLog {
  id: string;
  timestamp: string;
  type: ScanType;
  target: string;
  threatLevel: ThreatLevel;
  actionTaken: string;
}

// --- Mock Data (Replace with FastAPI fetch) ---
const MOCK_LOGS: SecurityLog[] = [
  { id: "LOG-8291A", timestamp: "2026-08-05T14:32:00Z", type: "URL", target: "http://secure-update-banking.com/login", threatLevel: "MALICIOUS", actionTaken: "Blocked Connection" },
  { id: "LOG-8291B", timestamp: "2026-08-05T11:15:22Z", type: "SMS", target: "URGENT: Your account is suspended. Click here to verify...", threatLevel: "SUSPICIOUS", actionTaken: "Flagged & Quarantined" },
  { id: "LOG-8291C", timestamp: "2026-08-04T09:45:10Z", type: "URL", target: "https://github.com/cybershield/core", threatLevel: "SAFE", actionTaken: "Allowed" },
  { id: "LOG-8291D", timestamp: "2026-08-03T16:20:05Z", type: "FILE", target: "invoice_Q3_final.exe", threatLevel: "MALICIOUS", actionTaken: "Deleted Payload" },
  { id: "LOG-8291E", timestamp: "2026-08-02T10:05:00Z", type: "SMS", target: "Hey, are we still on for the meeting tomorrow at 3 PM?", threatLevel: "SAFE", actionTaken: "Allowed" },
  { id: "LOG-8291F", timestamp: "2026-08-01T22:11:45Z", type: "URL", target: "http://bit.ly/free-crypto-giveaway-992", threatLevel: "SUSPICIOUS", actionTaken: "Warning Issued" },
];

export default function HistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [activeFilter, setActiveFilter] = useState<"ALL" | ThreatLevel>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Check Auth & Load Data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Simulate API network delay
    const loadData = setTimeout(() => {
      setLogs(MOCK_LOGS);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(loadData);
  }, [router]);

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesFilter = activeFilter === "ALL" || log.threatLevel === activeFilter;
    const matchesSearch = log.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // --- Helpers ---
  const getThreatColors = (level: ThreatLevel) => {
    switch (level) {
      case "MALICIOUS": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "SUSPICIOUS": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "SAFE": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const getThreatIcon = (level: ThreatLevel) => {
    switch (level) {
      case "MALICIOUS": return <ShieldAlert size={16} />;
      case "SUSPICIOUS": return <Shield size={16} />;
      case "SAFE": return <ShieldCheck size={16} />;
    }
  };

  const getTypeIcon = (type: ScanType) => {
    switch (type) {
      case "URL": return <GlobeLock size={18} />;
      case "SMS": return <MessageSquare size={18} />;
      case "FILE": return <FileCode2 size={18} />;
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  // --- Animation Variants ---
  // Use `any` to satisfy framer-motion's strict Variant typing in TS environments
  const containerVariants: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
        <p className="text-cyan-500/80 text-sm font-mono tracking-widest uppercase animate-pulse">
          Retrieving Event Logs...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-200 font-sans selection:bg-cyan-500/30 pb-20">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute right-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 shadow-inner">
                <History className="h-5 w-5 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Security Logs</h1>
            </div>
            <p className="text-sm text-zinc-400 font-medium">Historical audit of all intercepted threats and scanned payloads.</p>
          </div>

          <div className="flex items-center gap-3 text-sm font-mono text-cyan-500/80 bg-cyan-500/5 border border-cyan-500/10 px-4 py-2 rounded-lg">
            <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
            System Recording Active
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="rounded-[20px] border border-white/[0.05] bg-zinc-900/40 p-2 backdrop-blur-xl mb-6 flex flex-col sm:flex-row gap-2">
          
          {/* Search */}
          <div className="relative flex-1 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-cyan-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search IPs, URLs, or SMS content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-transparent bg-zinc-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-cyan-500/30 focus:bg-black"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="pl-2 pr-1 text-zinc-600">
              <Filter size={16} />
            </div>
            {(["ALL", "MALICIOUS", "SUSPICIOUS", "SAFE"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setActiveFilter(filterType)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                  activeFilter === filterType 
                    ? "bg-zinc-800 text-white shadow-sm border border-white/10" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                {filterType}
              </button>
            ))}
          </div>
        </div>

        {/* Log List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredLogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center rounded-[24px] border border-dashed border-white/[0.1] bg-black/20"
              >
                <Search size={32} className="text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-400 font-medium">No records found for this query.</p>
              </motion.div>
            ) : (
              filteredLogs.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  variants={itemVariants}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/[0.03] bg-zinc-900/30 p-4 transition-all hover:bg-zinc-800/50 hover:border-white/[0.08]"
                >
                  
                  {/* Left Side: Type & Target */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700/50 bg-black text-zinc-400 shadow-inner group-hover:text-cyan-400 transition-colors">
                      {getTypeIcon(log.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{log.id}</span>
                        <span className="h-1 w-1 rounded-full bg-zinc-700" />
                        <span className="text-[10px] font-medium text-zinc-500">{log.type} SCAN</span>
                      </div>
                      <p className="text-sm font-medium text-zinc-200 truncate pr-4">
                        {log.target}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Status, Action & Date */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t border-white/[0.05] sm:border-t-0 pt-3 sm:pt-0">
                    
                    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${getThreatColors(log.threatLevel)}`}>
                      {getThreatIcon(log.threatLevel)}
                      {log.threatLevel}
                    </div>

                    <div className="flex flex-col sm:items-end text-right">
                      <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                        {log.actionTaken} <ArrowRight size={12} className="hidden sm:inline-block" />
                      </span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <CalendarClock size={10} /> {formatDate(log.timestamp)}
                      </span>
                    </div>

                    {/* Mobile Only Menu Icon */}
                    <button className="sm:hidden text-zinc-500 hover:text-zinc-300">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}