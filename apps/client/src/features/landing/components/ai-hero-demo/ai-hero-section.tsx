"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChatConnectDemo } from "./chat-connect-demo";
import { SchedulePostDemo } from "./schedule-post-demo";
import type { HeroVariant } from "./hero-demo-data";

const VARIANTS: { id: HeroVariant; label: string; icon: string }[] = [
  { id: "chat", label: "Chat & kết nối", icon: "forum" },
  { id: "schedule", label: "Lên lịch đăng bài", icon: "event_available" },
];

export function AiHeroSection() {
  const [variant, setVariant] = useState<HeroVariant>("chat");

  return (
    <section
      // Cancels the shared (public) layout's `pt-[72px]` so the light hero
      // background fills the full width behind the fixed glass header instead
      // of leaving a gap; the `pt-24` below restores clearance for the nav.
      className="relative -mt-[72px] overflow-hidden pb-14 pt-24 md:pt-28"
      style={{ backgroundColor: "var(--color-background-light)" }}
    >
      {/* Soft amber glow at the top + faint neutral wash — light SaaS feel,
          no per-node starfield to composite (cheaper than the old dark hero). */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, rgba(245,158,11,0.12), transparent 70%), radial-gradient(50% 40% at 85% 30%, rgba(139,92,246,0.06), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1220px] px-6">
        {/* Fast switch between the two demo flows — no scrolling required. */}
        <div className="mx-auto mb-8 flex w-fit items-center rounded-full border border-primary-soft bg-card p-1 shadow-sm">
          {VARIANTS.map((v) => {
            const isActive = variant === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVariant(v.id)}
                aria-pressed={isActive}
                className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold sm:text-sm"
              >
                {isActive && (
                  <motion.span
                    layoutId="ai-hero-tab-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`material-symbols-outlined relative text-base ${isActive ? "text-background-dark" : "text-foreground-muted"}`}
                  aria-hidden
                >
                  {v.icon}
                </span>
                <span className={`relative ${isActive ? "text-background-dark" : "text-foreground-muted"}`}>{v.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={variant}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {variant === "chat" ? (
              <ChatConnectDemo active={variant === "chat"} />
            ) : (
              <SchedulePostDemo active={variant === "schedule"} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="relative mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary/10 px-3.5 py-1.5 text-[0.76rem] font-bold tracking-wide text-primary">
            CHÚNG TÔI LÀ AI
          </div>
          <p className="mx-auto mt-5 max-w-[760px] text-[1.4rem] font-semibold leading-relaxed text-foreground">
            Nơi <span className="text-primary">creator</span> và{" "}
            <span className="text-primary">nhãn hàng</span> gặp nhau — vận hành bằng AI.
          </p>
          <div className="mt-7 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-black text-foreground">2.000+</div>
              <div className="text-[0.76rem] font-semibold text-foreground-muted">KOL &amp; Creator</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-foreground">500+</div>
              <div className="text-[0.76rem] font-semibold text-foreground-muted">Nhãn hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-foreground">12+</div>
              <div className="text-[0.76rem] font-semibold text-foreground-muted">Ngành hàng</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hk-click-pulse {
          from { transform: scale(0.5); opacity: 1; }
          to { transform: scale(1.3); opacity: 0; }
        }
        @keyframes hk-caret-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes hk-typing-bounce {
          0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .hk-caret { animation: hk-caret-blink 1.05s step-end infinite; }
        .hk-typing-dot { animation: hk-typing-bounce 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hk-caret, .hk-typing-dot { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
