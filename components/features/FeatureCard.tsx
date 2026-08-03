"use client";

import Link from "next/link";
import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
};

export default function FeatureCard({
  icon,
  title,
  description,
  href,
}: Props) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-7 transition duration-300 hover:-translate-y-2 hover:border-cyan-500">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>

        <h3 className="mb-3 text-xl font-semibold text-white">
          {title}
        </h3>

        <p className="text-slate-400">
          {description}
        </p>
      </div>
    </Link>
  );
}