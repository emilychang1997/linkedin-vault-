"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

// Colors from Figma design tokens:
//   surface-palette = ocean (#0B66C2)  — default
//   hover           = ocean + 30% white overlay
//   active/press    = navy (#014589)
const BG_DEFAULT = "#0B66C2"; // var(--color-palette-ocean)
const BG_HOVER   = "linear-gradient(0deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.30) 100%), #0B66C2";
const BG_ACTIVE  = "#014589"; // var(--color-palette-navy)

export function PrimaryButton({ children, className = "", ...props }: PrimaryButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white font-semibold transition-shadow duration-150 ${className}`}
      style={{
        fontFamily: "Source Sans 3, sans-serif",
        fontSize: "18px",
        fontWeight: 600,
        color: "#FFFEFE", // token: text-invert
        backgroundColor: BG_DEFAULT,
        boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.08)",
        border: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = BG_HOVER;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = BG_DEFAULT;
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.background = BG_ACTIVE;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.background = BG_HOVER;
      }}
      {...props}
    >
      {children}
    </button>
  );
}
