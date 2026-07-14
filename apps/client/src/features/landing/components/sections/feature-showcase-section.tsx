"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { GALAXY_FEATURES, type GalaxyFeatureId } from "@/features/landing/components/feature-galaxy/galaxy-data";
import { AiMatchingReplica } from "@/features/landing/components/feature-galaxy/replicas/ai-matching-replica";
import { DashboardReplica } from "@/features/landing/components/feature-galaxy/replicas/dashboard-replica";
import { AnalysisReplica } from "@/features/landing/components/feature-galaxy/replicas/analysis-replica";
import { CampaignsReplica } from "@/features/landing/components/feature-galaxy/replicas/campaigns-replica";

const AUTO_CYCLE_MS = 6000;

// Galaxy view + the KOL ranking feature are temporarily hidden — this section
// now renders the light "live demo" browser mockup only.
const FEATURES = GALAXY_FEATURES.filter((f) => f.id !== "ranking");

const DEMOS: Record<string, { path: string; Replica: React.ComponentType }> = {
  "ai-matching": { path: "/kol-matching", Replica: AiMatchingReplica },
  dashboard: { path: "/dashboard", Replica: DashboardReplica },
  analysis: { path: "/kol-analysis", Replica: AnalysisReplica },
  campaigns: { path: "/campaign-management", Replica: CampaignsReplica },
};

export function FeatureShowcaseSection() {
  const [selectedId, setSelectedId] = useState<GalaxyFeatureId>(FEATURES[0].id);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const selected = FEATURES.find((f) => f.id === selectedId) ?? FEATURES[0];
  const demo = DEMOS[selected.id] ?? DEMOS["ai-matching"];

  // Pause the auto-cycle whenever the section is scrolled out of view (perf).
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoPlay || !inView) return;
    const timer = setInterval(() => {
      setSelectedId((current) => {
        const index = FEATURES.findIndex((f) => f.id === current);
        return FEATURES[(index + 1) % FEATURES.length].id;
      });
    }, AUTO_CYCLE_MS);
    return () => clearInterval(timer);
  }, [autoPlay, inView]);

  const handleSelect = (id: GalaxyFeatureId) => {
    setAutoPlay(false);
    setSelectedId(id);
  };

  return (
    <section
      ref={sectionRef}
      id="feature-showcase"
      className="relative overflow-hidden py-20 md:py-24"
    >
      <div className="relative mx-auto w-full max-w-[1400px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
            <span className="material-symbols-outlined text-base" aria-hidden>
              rocket_launch
            </span>
            Tính năng nổi bật
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-foreground md:text-5xl">
            Mọi tính năng, xoay quanh{" "}
            <span className="text-primary">chiến dịch của bạn</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground-muted">
            Từ ghép đôi AI đến chi trả an toàn — chọn một tính năng để xem demo
            trực tiếp hệ sinh thái Hive-K.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.38fr_0.62fr]">
          {/* Left: feature picker */}
          <div className="flex flex-col gap-3">
            {FEATURES.map((feature, index) => {
              const isActive = feature.id === selectedId;
              return (
                <motion.button
                  key={feature.id}
                  type="button"
                  onClick={() => handleSelect(feature.id)}
                  aria-pressed={isActive}
                  initial={{ opacity: 0, x: -28 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ x: 6 }}
                  whileTap={{ scale: 0.98 }}
                  className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                    isActive
                      ? "border-primary/60 bg-primary/10 shadow-primary"
                      : "border-primary-soft bg-card hover:border-primary/30 hover:bg-primary-soft"
                  }`}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in srgb, ${feature.color} 30%, transparent), color-mix(in srgb, ${feature.color} 10%, transparent))`,
                      border: `1px solid color-mix(in srgb, ${feature.color} 40%, transparent)`,
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-xl"
                      style={{ color: feature.color }}
                      aria-hidden
                    >
                      {feature.icon}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-bold ${isActive ? "text-foreground" : "text-foreground-muted group-hover:text-foreground"}`}
                    >
                      {feature.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-foreground-muted">
                      {feature.tagline}
                    </span>
                  </span>
                  <span
                    className={`material-symbols-outlined text-lg transition-all ${
                      isActive
                        ? "translate-x-0 text-primary opacity-100"
                        : "-translate-x-1 text-foreground-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                    }`}
                    aria-hidden
                  >
                    arrow_forward
                  </span>
                </motion.button>
              );
            })}

            <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-primary-soft bg-card px-4 py-3">
              <p className="text-[11px] text-foreground-muted">
                Dữ liệu minh hoạ — trải nghiệm đầy đủ khi bạn tạo tài khoản.
              </p>
              <Link
                href={AUTH_ROUTES.SIGN_IN}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-background-dark transition-colors hover:bg-primary/90"
              >
                Trải nghiệm thật
                <span className="material-symbols-outlined text-sm" aria-hidden>
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          {/* Right: monitor mockup with a Safari-style window running the demo. */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 90, damping: 16 }}
            className="relative select-none"
          >
            {/* Ambient glow behind the screen — CSS animation (compositor), not
                a framer loop (main-thread rAF). */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-primary/15 blur-3xl"
              style={{ animation: "hk-demo-glow 5s ease-in-out infinite" }}
              aria-hidden
            />

            {/* Screen bezel */}
            <div className="relative rounded-[1.4rem] border border-gray-700/60 bg-gray-900 p-2.5 shadow-2xl sm:p-3">
              <div
                className="overflow-hidden rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 35%, #b45309 75%, #f59e0b 100%)",
                }}
              >
                {/* macOS menu bar */}
                <div className="flex items-center justify-between px-4 py-1 text-[10px] font-medium text-white/80">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-xs" aria-hidden>
                      hive
                    </span>
                    <span className="font-bold">Hive-K</span>
                    <span className="hidden sm:inline">Tệp</span>
                    <span className="hidden sm:inline">Chỉnh sửa</span>
                    <span className="hidden sm:inline">Xem</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs" aria-hidden>
                      wifi
                    </span>
                    <span className="material-symbols-outlined text-xs" aria-hidden>
                      battery_full
                    </span>
                    <span>09:41</span>
                  </div>
                </div>

                {/* Safari window */}
                <div className="mx-3 mb-4 mt-1 overflow-hidden rounded-xl border border-black/20 bg-background-light shadow-2xl dark:bg-background-dark sm:mx-6 sm:mb-7">
                  {/* Safari toolbar */}
                  <div className="flex items-center gap-2 border-b border-primary-soft bg-card px-3 py-2 sm:gap-3">
                    <div className="flex gap-1.5" aria-hidden>
                      <span className="size-2.5 rounded-full bg-red-400" />
                      <span className="size-2.5 rounded-full bg-amber-400" />
                      <span className="size-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="hidden items-center gap-1 text-foreground-muted sm:flex" aria-hidden>
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                      <span className="material-symbols-outlined text-base opacity-40">
                        chevron_right
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg bg-muted px-3 py-1.5">
                      <span className="material-symbols-outlined text-[13px] text-emerald-500" aria-hidden>
                        lock
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={selected.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="truncate text-xs font-semibold text-foreground-muted"
                        >
                          hivek.vn{demo.path}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="hidden items-center gap-2 text-foreground-muted sm:flex" aria-hidden>
                      <span className="material-symbols-outlined text-base">ios_share</span>
                      <span className="material-symbols-outlined text-base">add</span>
                    </div>
                  </div>

                  {/* Page content */}
                  <div className="min-h-[21rem] p-4 sm:p-5">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selected.id}
                        initial={{ opacity: 0, y: 10, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.99 }}
                        transition={{ duration: 0.28 }}
                      >
                        <demo.Replica />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Monitor stand */}
            <div className="relative" aria-hidden>
              <div
                className="mx-auto h-10 w-28 bg-gradient-to-b from-gray-800 to-gray-700"
                style={{ clipPath: "polygon(20% 0, 80% 0, 100% 100%, 0 100%)" }}
              />
              <div className="mx-auto h-2.5 w-52 rounded-full bg-gray-800 shadow-lg" />
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes hk-demo-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        @media (prefers-reduced-motion: reduce) {
          #feature-showcase [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
