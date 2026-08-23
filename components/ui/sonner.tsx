"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-400" />
        ),
        info: (
          <InfoIcon className="size-4 text-cyan-400" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-400" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-red-400" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-cyan-400" />
        ),
      }}
      toastOptions={{
        style: {
          background: "rgba(9, 9, 11, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          color: "#f8fafc",
          borderRadius: "1rem",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
        },
        classNames: {
          toast: "group toast group-[.toaster]:bg-[#09090b]/90 group-[.toaster]:text-slate-100 group-[.toaster]:border-white/[0.08] group-[.toaster]:shadow-2xl",
          description: "group-[.toast]:text-zinc-400 text-xs font-mono uppercase tracking-wider",
          actionButton: "group-[.toast]:bg-cyan-500 group-[.toast]:text-black font-bold",
          cancelButton: "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-300",
          error: "group-[.toaster]:border-red-500/30 group-[.toaster]:bg-red-500/10",
          success: "group-[.toaster]:border-emerald-500/30 group-[.toaster]:bg-emerald-500/10",
          warning: "group-[.toaster]:border-amber-500/30 group-[.toaster]:bg-amber-500/10",
          info: "group-[.toaster]:border-cyan-500/30 group-[.toaster]:bg-cyan-500/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }