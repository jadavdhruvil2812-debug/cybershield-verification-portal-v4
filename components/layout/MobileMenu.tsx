"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ScanSearch,
  History,
  MessageSquareText,
  Info,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  name: string;
  email: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  loggedIn: boolean;
  user: User | null;
  logout: () => void;
}

const navItems = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Threat Radar", href: "/verify", icon: ScanSearch },
  { name: "Event Logs", href: "/history", icon: History },
  { name: "Feedback", href: "/feedback", icon: MessageSquareText },
  { name: "Intelligence", href: "/about", icon: Info },
];

export default function MobileMenu({
  isOpen,
  setIsOpen,
  loggedIn,
  user,
  logout,
}: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-t border-white/[0.05] bg-[#09090b]/95 backdrop-blur-2xl lg:hidden rounded-b-2xl shadow-2xl"
        >
          <div className="flex flex-col space-y-2 p-6">
            
            {/* Navigation Links */}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <motion.div
                  key={item.name}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-sm"
                        : "text-slate-300 hover:bg-white/[0.04] hover:text-cyan-400"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-cyan-400" : "text-slate-500"} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}

            {/* Auth / Profile Actions */}
            <div className="mt-6 border-t border-white/[0.08] pt-6">
              {loggedIn ? (
                <div className="space-y-4">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 transition-colors hover:border-cyan-500/40"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white shadow-md">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-semibold text-white truncate text-sm">{user?.name || "Operator"}</p>
                      <p className="text-xs text-zinc-400 truncate font-mono">{user?.email}</p>
                    </div>
                  </Link>

                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="w-full rounded-xl bg-red-500/10 border border-red-500/20 font-medium text-red-400 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <LogOut size={18} className="mr-2" />
                    Terminate Session
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-white/10 bg-white/5 font-medium text-slate-200 hover:bg-white/10"
                    >
                      <LogIn size={16} className="mr-2" />
                      Login
                    </Button>
                  </Link>

                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full rounded-xl bg-cyan-500 font-bold text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20">
                      <UserPlus size={16} className="mr-2" />
                      Initialize
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Security Status Footnote */}
            <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              <ShieldCheck size={14} className="text-emerald-500" />
              Encrypted Mobile Terminal
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}