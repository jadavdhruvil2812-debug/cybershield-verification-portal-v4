"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  ScanSearch,
  History,
  MessageSquareText,
  Info,
} from "lucide-react";

const navItems = [
  { name: "Overview", href: "/", icon: Home },
  { name: "Threat Radar", href: "/verify", icon: ScanSearch },
  { name: "Event Logs", href: "/history", icon: History },
  { name: "Feedback", href: "/feedback", icon: MessageSquareText },
  { name: "Intelligence", href: "/about", icon: Info },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-1 rounded-full border border-white/[0.08] bg-zinc-950/60 p-1.5 backdrop-blur-2xl shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              isActive ? "text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon size={15} className={`relative z-10 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
            <span className="relative z-10">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}