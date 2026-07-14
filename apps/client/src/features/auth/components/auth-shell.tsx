"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type AuthAccent = {
  /** CSS color (var or literal) driving the page's glow/chip/focus states. */
  color: string;
  /** Icon + text for the eyebrow chip above the heading. */
  chipIcon: string;
  chipLabel: string;
};

/** Staggered entrance shared by every block inside the shell. */
export const riseIn = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

type AuthShellProps = {
  accent: AuthAccent;
  /** Heading with the accent word wrapped by the caller via <AccentWord>. */
  heading: ReactNode;
  subtitle: string;
  children: ReactNode;
  /** Cross link under the card: "Chưa có tài khoản? …" */
  footer: ReactNode;
  className?: string;
};

/**
 * Page shell for auth screens, in the landing page's design language:
 * eyebrow chip, font-black heading with an accent word, and a glass card
 * with a gradient border + corner glow. Each page passes its own accent
 * so sign-in (amber) and sign-up (purple) feel distinct.
 */
export function AuthShell({ accent, heading, subtitle, children, footer, className }: AuthShellProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn("w-full", className)}
      style={
        {
          "--auth-accent": accent.color,
          "--auth-ring": `color-mix(in srgb, ${accent.color} 22%, transparent)`,
        } as React.CSSProperties
      }
    >
      <motion.div variants={riseIn} className="mb-8 flex flex-col items-center gap-4 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold"
          style={{
            color: accent.color,
            borderColor: `color-mix(in srgb, ${accent.color} 35%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${accent.color} 10%, transparent)`,
          }}
        >
          <span className="material-symbols-outlined text-sm" aria-hidden>
            {accent.chipIcon}
          </span>
          {accent.chipLabel}
        </span>

        <h1 className="text-3xl font-black leading-tight tracking-tight text-white md:text-4xl">
          {heading}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-white/55">{subtitle}</p>
      </motion.div>

      {/* Gradient-border glass card */}
      <motion.div
        variants={riseIn}
        className="relative rounded-[1.75rem] p-px"
        style={{
          background: `linear-gradient(165deg, color-mix(in srgb, ${accent.color} 50%, transparent) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.06) 62%, color-mix(in srgb, ${accent.color} 28%, transparent) 100%)`,
        }}
      >
        <div
          className="relative overflow-hidden rounded-[calc(1.75rem-1px)] px-6 py-8 sm:px-9"
          style={{ backgroundColor: "rgba(10, 14, 28, 0.86)", backdropFilter: "blur(16px)" }}
        >
          {/* Top sheen line */}
          <span
            className="pointer-events-none absolute inset-x-10 top-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${accent.color} 75%, white), transparent)`,
            }}
            aria-hidden
          />
          {/* Corner nebula glow */}
          <span
            className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-[80px]"
            style={{ backgroundColor: `color-mix(in srgb, ${accent.color} 26%, transparent)` }}
            aria-hidden
          />

          <div className="relative">{children}</div>
        </div>
      </motion.div>

      <motion.p variants={riseIn} className="mt-6 text-center text-sm font-medium text-white/55">
        {footer}
      </motion.p>

      <motion.p variants={riseIn} className="mt-3 text-center text-[11px] leading-relaxed text-white/35">
        Bằng việc tiếp tục, bạn đồng ý với{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-white/60">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-white/60">
          Chính sách quyền riêng tư
        </Link>{" "}
        của Hive-K.
      </motion.p>
    </motion.div>
  );
}

/** The accent-colored word inside the shell heading. */
export function AccentWord({ color, children }: { color: string; children: ReactNode }) {
  return <span style={{ color }}>{children}</span>;
}
