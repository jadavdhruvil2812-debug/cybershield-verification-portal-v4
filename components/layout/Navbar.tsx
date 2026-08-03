"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Menu,
  Shield,
  X,
  MessageSquare,
  Globe,
  Home,
  MessageCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Verify SMS",
    href: "/verify",
    icon: MessageSquare,
  },
  {
    name: "Verify URL",
    href: "/verify-url",
    icon: Globe,
  },
  {
    name: "Feedback",
    href: "/feedback",
    icon: MessageCircle,
  },
  {
    name: "About",
    href: "/about",
    icon: Info,
  },
  {
    name: "QR Scanner",
    href: "/verify-qr",
    icon: Shield,
  }
];
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-cyan-400" />
          <div>
            <h1 className="text-lg font-bold text-white">
              CyberShield
            </h1>
            <p className="-mt-1 text-xs text-slate-400">
              Verification Portal
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
         {navItems.map((item) => {
  const Icon = item.icon;

  return (
    <Link
      key={item.name}
      href={item.href}
      className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-cyan-400"
    >
      <Icon size={16} />
      {item.name}
    </Link>
  );
})}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">
              Login
            </Button>
          </Link>

          <Link href="/signup">
            <Button>
              Sign Up
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="border-t border-slate-800 bg-slate-950 md:hidden">
          <div className="flex flex-col p-5">
            {navItems.map((item) => {
  const Icon = item.icon;

  return (
    <Link
      key={item.name}
      href={item.href}
      onClick={() => setOpen(false)}
      className="flex items-center gap-3 py-3 text-slate-300 hover:text-cyan-400"
    >
      <Icon size={18} />
      {item.name}
    </Link>
  );
})}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
            >
              <Button
                className="mt-4 w-full"
                variant="outline"
              >
                Login
              </Button>
            </Link>

            <Link
              href="/signup"
              onClick={() => setOpen(false)}
            >
              <Button className="mt-3 w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}