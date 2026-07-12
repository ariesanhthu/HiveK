"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ChatConnectDemo } from "./chat-connect-demo";
import { SchedulePostDemo } from "./schedule-post-demo";
import type { HeroVariant } from "./hero-demo-data";

// Deterministic star field (seeded LCG) so SSR and client render identically
// — same trick as the feature-showcase section's space background.
function seededStars(count: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: count }, (_, id) => ({
    id,
    top: rand() * 100,
    left: rand() * 100,
    size: rand() * 1.6 + 1,
  }));
}

const STARS = seededStars(28, 11);

const VARIANTS: { id: HeroVariant; label: string; icon: string }[] = [
  { id: "chat", label: "Chat & kết nối", icon: "forum" },
  { id: "schedule", label: "Lên lịch đăng bài", icon: "event_available" },
];

export function AiHeroSection() {
  const [variant, setVariant] = useState<HeroVariant>("chat");

  return (
    <section
      className="relative overflow-hidden pb-14 pt-24 md:pt-28"
      style={{
        backgroundColor: "var(--color-background-dark)",
        backgroundImage:
          "radial-gradient(1.5px 1.5px at 20% 20%, rgba(255,255,255,0.45) 50%, transparent 51%), radial-gradient(1px 1px at 75% 40%, rgba(255,255,255,0.35) 50%, transparent 51%), radial-gradient(1.5px 1.5px at 55% 75%, rgba(255,255,255,0.28) 50%, transparent 51%), radial-gradient(1px 1px at 88% 65%, rgba(255,255,255,0.35) 50%, transparent 51%)",
        backgroundSize: "320px 320px, 260px 260px, 380px 380px, 300px 300px",
      }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {STARS.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white/40"
            style={{ top: `${star.top}%`, left: `${star.left}%`, width: star.size, height: star.size }}
          />
        ))}
        <div
          className="absolute left-1/2 top-0 h-[340px] w-[760px] -translate-x-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.18), transparent 66%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-[1220px] px-6">
        {/* Fast switch between the two demo flows — no scrolling required. */}
        <div className="mx-auto mb-8 flex w-fit items-center rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-md">
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
                  className={`material-symbols-outlined relative text-base ${isActive ? "text-background-dark" : "text-white/70"}`}
                  aria-hidden
                >
                  {v.icon}
                </span>
                <span className={`relative ${isActive ? "text-background-dark" : "text-white/70"}`}>{v.label}</span>
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
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-[0.76rem] font-bold tracking-wide text-white">
            CHÚNG TÔI LÀ AI
          </div>
          <p className="mx-auto mt-5 max-w-[760px] text-[1.4rem] font-semibold leading-relaxed text-slate-100">
            Nơi <span className="text-primary">creator</span> và{" "}
            <span className="text-primary">nhãn hàng</span> gặp nhau — vận hành bằng AI.
          </p>
          <div className="mt-7 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-black text-white">2.000+</div>
              <div className="text-[0.76rem] font-semibold text-slate-400">KOL &amp; Creator</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">500+</div>
              <div className="text-[0.76rem] font-semibold text-slate-400">Nhãn hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">12+</div>
              <div className="text-[0.76rem] font-semibold text-slate-400">Ngành hàng</div>
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
