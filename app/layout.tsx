import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CyberShield | AI Digital Threat Verification Portal",
  description:
    "Unified verification platform for real-time SMS fraud detection, Image OCR analysis, deep QR matrix inspection, and URL reputation intelligence.",
  keywords: [
    "CyberShield",
    "SMS Phishing Detection",
    "QR Code Scanner",
    "UPI Fraud Check",
    "Image OCR Verification",
    "URL Threat Intelligence",
  ],
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
        <Navbar />

        <main className="flex-1">{children}</main>

        <Footer />

        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}