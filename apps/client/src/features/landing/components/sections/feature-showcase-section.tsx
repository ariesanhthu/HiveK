"use client";

import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { GalaxyOrbit } from "@/features/landing/components/feature-galaxy/feature-orbit";
import { GALAXY_FEATURES, type GalaxyFeatureId } from "@/features/landing/components/feature-galaxy/galaxy-data";
import { AiMatchingReplica } from "@/features/landing/components/feature-galaxy/replicas/ai-matching-replica";
import { DashboardReplica } from "@/features/landing/components/feature-galaxy/replicas/dashboard-replica";
import { AnalysisReplica } from "@/features/landing/components/feature-galaxy/replicas/analysis-replica";
import { CampaignsReplica } from "@/features/landing/components/feature-galaxy/replicas/campaigns-replica";
import { RankingReplica } from "@/features/landing/components/feature-galaxy/replicas/ranking-replica";

const AUTO_CYCLE_MS = 6000;

/** Camera dive: how much the whole system magnifies around the clicked planet. */
const ZOOM_SCALE = 4;
const ZOOM_TRANSITION = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

type ViewMode = "galaxy" | "demo";

const DEMOS: Record<GalaxyFeatureId, { path: string; Replica: React.ComponentType }> = {
  "ai-matching": { path: "/kol-matching", Replica: AiMatchingReplica },
  dashboard: { path: "/dashboard", Replica: DashboardReplica },
  analysis: { path: "/kol-analysis", Replica: AnalysisReplica },
  campaigns: { path: "/campaign-management", Replica: CampaignsReplica },
  ranking: { path: "/kol-ranking", Replica: RankingReplica },
};

// Deterministic star field (seeded LCG) so SSR and client render identically.
function seededStars(count: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: count }, (_, id) => ({
    id,
    top: rand() * 100,
    left: rand() * 100,
    size: rand() * 1.8 + 1,
    delay: rand() * 4,
    duration: rand() * 3 + 2,
  }));
}

// 56 stars, only half twinkle — every animated node costs a compositor layer.
const STARS = seededStars(56, 7);

export function FeatureShowcaseSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("galaxy");
  const [selectedId, setSelectedId] = useState<GalaxyFeatureId>("ai-matching");
  const [autoPlay, setAutoPlay] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [inView, setInView] = useState(false);

  // Scroll-linked motion: stars and nebula drift at different speeds
  // (parallax) while the whole solar system grows in as it enters the view.
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const starsY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const nebulaY = useTransform(scrollYProgress, [0, 1], ["10%", "-10%"]);
  const galaxyScale = useTransform(scrollYProgress, [0, 0.35], [0.72, 1]);
  const galaxyOpacity = useTransform(scrollYProgress, [0.02, 0.3], [0, 1]);

  const selected = GALAXY_FEATURES.find((f) => f.id === selectedId) ?? GALAXY_FEATURES[0];
  const demo = DEMOS[selected.id];

  // Camera dive transform for the whole orbital plane. Motion values (not
  // state) so a re-zoom can read the mid-flight position.
  const zoomLayerRef = useRef<HTMLDivElement>(null);
  const zoomX = useMotionValue(0);
  const zoomY = useMotionValue(0);
  const zoomScale = useMotionValue(1);

  /**
   * Zoom INTO the clicked planet in place: translate + scale the whole system
   * so the planet lands at the layer's center — the rest of the solar system
   * stays visible around it instead of being swapped for a detached close-up.
   * Solving screen = C + g·(t + s·p) for the translation t that puts the
   * planet's local position p at the center C (g = outer scroll-linked scale).
   */
  const zoomToPlanet = useCallback(
    (id: GalaxyFeatureId) => {
      const layer = zoomLayerRef.current;
      const planet = sectionRef.current?.querySelector<HTMLElement>(
        `[data-planet-id="${id}"]`,
      );
      if (!layer || !planet) return;

      const g = galaxyScale.get();
      const tX = zoomX.get();
      const tY = zoomY.get();
      const s = zoomScale.get();
      const planetBox = planet.getBoundingClientRect();
      const layerBox = layer.getBoundingClientRect();
      // Rect centers include the current transform; peel it off to recover
      // the planet's untransformed local offset from the layer center.
      const centerX = layerBox.left + layerBox.width / 2 - g * tX;
      const centerY = layerBox.top + layerBox.height / 2 - g * tY;
      const localX = ((planetBox.left + planetBox.width / 2 - centerX) / g - tX) / s;
      const localY = ((planetBox.top + planetBox.height / 2 - centerY) / g - tY) / s;

      animate(zoomX, -ZOOM_SCALE * localX, ZOOM_TRANSITION);
      animate(zoomY, -ZOOM_SCALE * localY, ZOOM_TRANSITION);
      animate(zoomScale, ZOOM_SCALE, ZOOM_TRANSITION);
    },
    [galaxyScale, zoomX, zoomY, zoomScale],
  );

  const closeZoom = useCallback(() => {
    setZoomed(false);
    animate(zoomX, 0, ZOOM_TRANSITION);
    animate(zoomY, 0, ZOOM_TRANSITION);
    animate(zoomScale, 1, ZOOM_TRANSITION);
  }, [zoomX, zoomY, zoomScale]);

  // Chip click: select — and re-aim the camera if already zoomed in.
  const handleSelect = useCallback(
    (id: GalaxyFeatureId) => {
      setAutoPlay(false);
      setSelectedId(id);
      if (zoomed) zoomToPlanet(id);
    },
    [zoomed, zoomToPlanet],
  );

  // Planet click: select AND dive into the planet.
  const handleZoomInto = useCallback(
    (id: GalaxyFeatureId) => {
      setAutoPlay(false);
      setSelectedId(id);
      zoomToPlanet(id);
      setZoomed(true);
    },
    [zoomToPlanet],
  );

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeZoom();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, closeZoom]);

  // Perf: the section runs ~40 infinite compositor animations. Sleep them all
  // (and the auto-cycle) whenever the section is scrolled out of view or the
  // demo panel is showing.
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
    if (!autoPlay || !inView || viewMode !== "galaxy") return;
    const timer = setInterval(() => {
      setSelectedId((current) => {
        const index = GALAXY_FEATURES.findIndex((f) => f.id === current);
        return GALAXY_FEATURES[(index + 1) % GALAXY_FEATURES.length].id;
      });
    }, AUTO_CYCLE_MS);
    return () => clearInterval(timer);
  }, [autoPlay, inView, viewMode]);

  const showDemo = () => {
    if (zoomed) closeZoom();
    setViewMode("demo");
  };

  return (
    <section
      ref={sectionRef}
      id="feature-showcase"
      className={`relative flex min-h-screen flex-col justify-center overflow-hidden py-20 md:py-24 ${
        inView ? "" : "hk-asleep"
      }`}
      style={{ backgroundColor: viewMode === "galaxy" ? "#0b1020" : undefined }}
    >
      {viewMode === "galaxy" && (
        <>
          {/* Star field — drifts slowly against the scroll (parallax) */}
          <motion.div
            className="pointer-events-none absolute inset-[-10%_0]"
            style={{ y: starsY }}
            aria-hidden
          >
            {STARS.map((star) => (
              <span
                key={star.id}
                className="absolute rounded-full bg-white"
                style={{
                  top: `${star.top}%`,
                  left: `${star.left}%`,
                  width: star.size,
                  height: star.size,
                  ...(star.id % 2 === 0
                    ? { animation: `hk-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite` }
                    : { opacity: 0.35 }),
                }}
              />
            ))}
            {/* Shooting stars */}
            <span
              className="absolute right-[8%] top-[12%] h-px w-32"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9))",
                animation: "hk-shoot 9s linear 2s infinite",
              }}
            />
            <span
              className="absolute right-[35%] top-[6%] h-px w-24"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7))",
                animation: "hk-shoot 13s linear 7s infinite",
              }}
            />
          </motion.div>

          {/* Nebula glows — drift the opposite way for depth */}
          <motion.div
            className="pointer-events-none absolute inset-[-10%_0]"
            style={{
              y: nebulaY,
              background:
                "radial-gradient(40% 45% at 15% 20%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%), radial-gradient(45% 50% at 85% 80%, color-mix(in srgb, var(--color-creator-purple) 14%, transparent) 0%, transparent 70%)",
            }}
            aria-hidden
          />
        </>
      )}

      <div className="relative mx-auto w-full max-w-[1400px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto mb-8 max-w-2xl text-center"
        >
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold ${
              viewMode === "galaxy"
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-primary-soft bg-primary/10 text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-base" aria-hidden>
              rocket_launch
            </span>
            Vũ trụ tính năng
          </span>
          <h2
            className={`mt-4 text-3xl font-black tracking-tight md:text-5xl ${
              viewMode === "galaxy" ? "text-white" : "text-foreground"
            }`}
          >
            Mọi tính năng, xoay quanh{" "}
            <span className="text-primary">chiến dịch của bạn</span>
          </h2>
          <p
            className={`mt-4 text-base leading-relaxed ${
              viewMode === "galaxy" ? "text-white/60" : "text-foreground-muted"
            }`}
          >
            Chạm vào từng hành tinh để khám phá hệ sinh thái Hive-K — từ ghép đôi
            AI đến chi trả an toàn.
          </p>
        </motion.div>

        {/* Fast switch — toggles the content area below between the galaxy
            picker and the live demo mockup without scrolling to another
            section. */}
        <div className="relative z-10 mx-auto mb-8 flex w-fit items-center rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-md">
          {(
            [
              { mode: "galaxy" as const, label: "Vũ trụ tính năng", icon: "hub" },
              { mode: "demo" as const, label: "Xem demo trực tiếp", icon: "play_circle" },
            ]
          ).map((tab) => {
            const isActive = viewMode === tab.mode;
            return (
              <button
                key={tab.mode}
                type="button"
                onClick={() => (tab.mode === "demo" ? showDemo() : setViewMode("galaxy"))}
                aria-pressed={isActive}
                className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold sm:text-sm"
              >
                {isActive && (
                  <motion.span
                    layoutId="showcase-tab-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`material-symbols-outlined relative text-base ${
                    isActive ? "text-background-dark" : "text-white/70"
                  }`}
                  aria-hidden
                >
                  {tab.icon}
                </span>
                <span className={`relative ${isActive ? "text-background-dark" : "text-white/70"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {viewMode === "galaxy" ? (
            <motion.div
              key="galaxy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Full-width galaxy with the detail card floating over it */}
              <div className="relative">
                {/* Scroll-linked reveal: the system grows in as you scroll down.
                    lg:pr reserves room for the detail card on the right (same value
                    as the close-up view) so it never covers the planets. */}
                <motion.div
                  className="lg:pr-[430px]"
                  style={{ scale: galaxyScale, opacity: galaxyOpacity }}
                >
                  {/* Camera dive: on planet click this layer translates + scales so
                      the planet ends up centered and enlarged IN the solar system.
                      hk-paused freezes only the orbital motion (hk-orbit) so the
                      zoom target stays put — moons, sun and asteroids keep moving. */}
                  <motion.div
                    ref={zoomLayerRef}
                    style={{ x: zoomX, y: zoomY, scale: zoomScale }}
                    className={zoomed ? "hk-paused pointer-events-none" : ""}
                  >
                    <GalaxyOrbit
                      selectedId={selectedId}
                      zoomedId={zoomed ? selectedId : null}
                      onSelect={handleZoomInto}
                    />
                  </motion.div>
                </motion.div>

                {/* Zoom-mode chrome: click anywhere to fly back out. */}
                <AnimatePresence>
                  {zoomed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 z-[5]"
                    >
                      <button
                        type="button"
                        onClick={closeZoom}
                        aria-label="Thu nhỏ về toàn cảnh vũ trụ"
                        className="absolute inset-0 cursor-zoom-out"
                      />

                      <button
                        type="button"
                        onClick={closeZoom}
                        className="absolute left-1/2 top-2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur-md transition-colors hover:bg-white/10 hover:text-white lg:left-6 lg:translate-x-0"
                        style={{ backgroundColor: "rgba(7, 11, 24, 0.6)" }}
                      >
                        <span className="material-symbols-outlined text-base" aria-hidden>
                          zoom_out_map
                        </span>
                        Quay lại vũ trụ
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Detail card: glass overlay pinned to the right on desktop,
                    stacked below the galaxy on mobile. */}
                <div className="relative z-10 mx-auto mt-8 w-full max-w-xl lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:w-[400px] lg:max-w-none lg:-translate-y-1/2">
                  <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    // No backdrop-blur here: blurring a backdrop with orbiting
                    // planets behind it re-renders the filter every frame.
                    className="relative min-h-[18rem] overflow-hidden rounded-3xl border border-white/10 p-7 sm:p-8"
                    style={{ backgroundColor: "rgba(11, 16, 32, 0.92)" }}
                  >
                    <div
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-[70px]"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${selected.color} 28%, transparent)`,
                        transition: "background-color .6s",
                      }}
                      aria-hidden
                    />

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selected.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <div className="flex items-center gap-4">
                          <span
                            className="flex h-14 w-14 items-center justify-center rounded-2xl"
                            style={{
                              background: `linear-gradient(135deg, color-mix(in srgb, ${selected.color} 35%, transparent), color-mix(in srgb, ${selected.color} 12%, transparent))`,
                              border: `1px solid color-mix(in srgb, ${selected.color} 45%, transparent)`,
                            }}
                          >
                            <span
                              className="material-symbols-outlined text-3xl"
                              style={{ color: selected.color }}
                              aria-hidden
                            >
                              {selected.icon}
                            </span>
                          </span>
                          <div>
                            <h3 className="text-xl font-black text-white sm:text-2xl">
                              {selected.label}
                            </h3>
                            <p className="mt-1 text-sm text-white/60">{selected.tagline}</p>
                          </div>
                        </div>

                        <ul className="mt-6 flex flex-col gap-3">
                          {selected.highlights.map((highlight, i) => (
                            <motion.li
                              key={highlight}
                              initial={{ opacity: 0, x: 16 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                              className="flex items-start gap-3 text-sm text-white/80"
                            >
                              <span
                                className="material-symbols-outlined mt-0.5 text-lg"
                                style={{ color: selected.color }}
                                aria-hidden
                              >
                                check_circle
                              </span>
                              {highlight}
                            </motion.li>
                          ))}
                        </ul>

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                          <motion.button
                            type="button"
                            onClick={showDemo}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.94 }}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-background-dark shadow-primary hover:bg-primary/90"
                          >
                            Xem demo ngay
                            <span className="material-symbols-outlined text-base" aria-hidden>
                              arrow_forward
                            </span>
                          </motion.button>
                          <Link
                            href={AUTH_ROUTES.SIGN_IN}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                          >
                            Bắt đầu miễn phí
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </div>
              </div>

              {/* Planet picker chips + auto-cycle progress, centered under the system */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative z-10 mx-auto mt-10 flex w-full max-w-2xl flex-col items-center"
              >
                <div className="flex flex-wrap justify-center gap-2">
                  {GALAXY_FEATURES.map((feature) => {
                    const isActive = feature.id === selectedId;
                    return (
                      <motion.button
                        key={feature.id}
                        type="button"
                        onClick={() => handleSelect(feature.id)}
                        whileHover={{ scale: 1.07, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold"
                        style={{
                          color: isActive ? feature.color : "rgba(255,255,255,0.55)",
                          borderColor: isActive
                            ? `color-mix(in srgb, ${feature.color} 60%, transparent)`
                            : "rgba(255,255,255,0.12)",
                          backgroundColor: isActive
                            ? `color-mix(in srgb, ${feature.color} 14%, transparent)`
                            : "transparent",
                        }}
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden>
                          {feature.icon}
                        </span>
                        {feature.label}
                      </motion.button>
                    );
                  })}
                </div>

                {autoPlay && (
                  <div className="mt-4 h-0.5 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                    {/* scaleX not width — width animation forces layout every frame */}
                    <motion.div
                      key={selectedId}
                      className="h-full origin-left rounded-full"
                      style={{ backgroundColor: selected.color }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: AUTO_CYCLE_MS / 1000, ease: "linear" }}
                    />
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="demo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.38fr_0.62fr]"
            >
              {/* Left: feature picker */}
              <div className="flex flex-col gap-3">
                {GALAXY_FEATURES.map((feature, index) => {
                  const isActive = feature.id === selectedId;
                  return (
                    <motion.button
                      key={feature.id}
                      type="button"
                      onClick={() => setSelectedId(feature.id)}
                      aria-pressed={isActive}
                      initial={{ opacity: 0, x: -28 }}
                      animate={{ opacity: 1, x: 0 }}
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

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-primary-soft bg-card px-4 py-3"
                >
                  <p className="text-[11px] text-foreground-muted">
                    Dữ liệu minh hoạ — trải nghiệm đầy đủ khi bạn tạo tài khoản.
                  </p>
                  <a
                    href="/auth/sign-in"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-background-dark transition-colors hover:bg-primary/90"
                  >
                    Trải nghiệm thật
                    <span className="material-symbols-outlined text-sm" aria-hidden>
                      arrow_forward
                    </span>
                  </a>
                </motion.div>
              </div>

              {/* Right: monitor mockup with a Safari-style window running the demo. */}
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.1 }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes hk-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.9; }
        }
        @keyframes hk-shoot {
          0% { transform: translate3d(0, 0, 0) rotate(-30deg); opacity: 0; }
          4% { opacity: 1; }
          18% { transform: translate3d(-55vw, 32vh, 0) rotate(-30deg); opacity: 0; }
          100% { transform: translate3d(-55vw, 32vh, 0) rotate(-30deg); opacity: 0; }
        }
        /* Orbit engine — compositor-thread CSS animations (see spinStyle()). */
        @keyframes hk-spin { to { transform: rotate(360deg); } }
        @keyframes hk-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes hk-ripple {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes hk-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes hk-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        @keyframes hk-sheen {
          0% { transform: translateX(-130%); }
          60%, 100% { transform: translateX(130%); }
        }
        @keyframes hk-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(3px); }
        }
        @keyframes hk-demo-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.9; }
        }
        /* While zoomed, freeze ONLY the planets' orbital motion (hk-orbit)
           so the camera's zoom target stays fixed — moons keep orbiting. */
        .hk-paused .hk-orbit { animation-play-state: paused !important; }
        /* Off-screen: sleep every animation in the section (perf). */
        .hk-asleep * { animation-play-state: paused !important; }
        @media (prefers-reduced-motion: reduce) {
          #feature-showcase [style*="animation"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
