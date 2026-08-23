"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Shield,
  Home,
  Radar,
  Activity,
  MessageSquare,
  Command,
  User as UserIcon,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface User {
  name: string;
  email: string;
}

const navItems = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Threat Radar", href: "/verify", icon: Radar },
  { name: "Event Logs", href: "/history", icon: Activity },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Intelligence", href: "/about", icon: Command },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setLoggedIn(true);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Session parse error");
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setLoggedIn(false);
    setUser(null);
    setProfileOpen(false);
    setOpen(false);
    router.push("/login");
  }

  return (
    /* 
      BUG FIX: Using 'sticky' instead of 'fixed' and adding 'mb-12'. 
      This keeps the floating aesthetic but forces the document flow 
      to push your page titles (like "CyberShield Verification") down properly.
    */
    <div className="sticky top-6 z-50 mb-12 flex w-full justify-center px-4 pointer-events-none">
      <motion.header 
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="pointer-events-auto relative flex w-full max-w-[1000px] items-center justify-between rounded-full border border-white/[0.08] bg-[#09090b]/80 p-2 pl-4 pr-2 shadow-2xl shadow-cyan-900/10 backdrop-blur-2xl"
      >
        
        {/* Ambient Glow Effect */}
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 opacity-60 blur-xl" />

        {/* Brand Logo */}
        <Link href="/" className="group relative flex items-center gap-3 pr-6">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-zinc-800 to-black border border-zinc-700 shadow-inner overflow-hidden">
            <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <Shield className="relative z-10 h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white leading-none">
              CyberShield
            </span>
            <span className="text-[10px] font-medium tracking-widest text-zinc-500 uppercase mt-1">
              Terminal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 relative" onMouseLeave={() => setHoveredPath(null)}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isHovered = hoveredPath === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredPath(item.href)}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 z-10 ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {/* Magnetic Hover Indicator */}
                {isHovered && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.05]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Active Underline Glow */}
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute -bottom-[2px] left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                  />
                )}
                
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions / Auth */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          {loggedIn ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group relative flex h-10 items-center gap-3 rounded-full border border-white/[0.05] bg-white/[0.03] pl-1 pr-4 transition-all hover:bg-white/[0.06]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-900 text-xs font-bold text-white shadow-inner">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-semibold text-zinc-200 leading-none">
                    {user?.name?.split(' ')[0] || "Operator"}
                  </span>
                  <div className="flex items-center gap-1 mt-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] text-emerald-400/90 font-mono uppercase tracking-wider leading-none">Secured</span>
                  </div>
                </div>
              </button>

              {/* Dynamic Island Profile Card */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(8px)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="absolute right-0 mt-4 w-72 origin-top-right rounded-[24px] border border-zinc-800 bg-[#09090b]/95 p-2 shadow-2xl backdrop-blur-2xl"
                  >
                    {/* User ID Card */}
                    <div className="relative overflow-hidden rounded-[18px] bg-zinc-900/60 p-4 border border-white/[0.03]">
                      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-cyan-500/20 blur-2xl" />
                      
                      <div className="relative z-10 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-black shadow-inner">
                          <UserIcon className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white truncate max-w-[150px]">{user?.name}</p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate max-w-[150px]">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between rounded-lg bg-black/50 px-3 py-2 border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Clearance</span>
                        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                          <Sparkles size={12} /> Root Access
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-1 p-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
                      >
                        Configuration
                        <ChevronRight size={14} className="text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
                      </Link>
                      
                      <button
                        onClick={logout}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        Disconnect Session
                        <LogOut size={14} className="opacity-50 transition-opacity group-hover:opacity-100" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost" className="h-10 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.04]">
                  Authenticate
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="h-10 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Initialize
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.05] bg-white/[0.02] md:hidden text-zinc-400 hover:text-white"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Full-Screen Blur Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 top-[88px] z-40 bg-black/60 pointer-events-auto md:hidden"
          >
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="m-4 rounded-[24px] border border-white/[0.08] bg-[#09090b]/90 p-2 shadow-2xl"
            >
              <div className="flex flex-col gap-1">
                {navItems.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      key={item.name}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-4 rounded-[16px] p-4 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-cyan-500/10 text-cyan-400"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                        }`}
                      >
                        <Icon size={18} />
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}