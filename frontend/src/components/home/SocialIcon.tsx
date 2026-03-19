import { type ReactNode } from "react";
import React from "react";

type SocialIconProps = {
  href: string;
  label: string;
  children: ReactNode;
};

export default function SocialIcon({ href, label, children }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-slate-400 hover:text-emerald-300 transition-colors"
      aria-label={label}
    >
      {children}
    </a>
  );
}

