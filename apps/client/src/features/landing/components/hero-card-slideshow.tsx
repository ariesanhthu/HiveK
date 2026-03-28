"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const AUTO_MS = 5200;
const SLIDE_COUNT = 3;

const IMG_BRAND =
  "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=160&h=160&fit=crop";
const IMG_CREATOR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop";

const LIVE_BAR_DATA = [
  { t: "2h", v: 58 },
  { t: "4h", v: 104 },
  { t: "6h", v: 79 },
  { t: "8h", v: 127 },
  { t: "10h", v: 92 },
  { t: "12h", v: 137 },
  { t: "14h", v: 112 },
] as const;

const liveBarChartConfig = {
  v: {
    label: "Chỉ số",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

const MATCH_TREND_DATA = [
  { x: "1", y: 24 },
  { x: "2", y: 38 },
  { x: "3", y: 35 },
  { x: "4", y: 58 },
  { x: "5", y: 72 },
  { x: "6", y: 88 },
  { x: "7", y: 98 },
] as const;

const matchTrendChartConfig = {
  y: {
    label: "Điểm khớp",
    color: "var(--color-tech-blue)",
  },
} satisfies ChartConfig;

function DotNav({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Chọn thẻ minh họa">
      {Array.from({ length: SLIDE_COUNT }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`Thẻ ${i + 1}`}
          onClick={() => onSelect(i)}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === active 
              ? "w-8 bg-primary" 
              : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
          )}
        />
      ))}
    </div>
  );
}

function AnimatedScoreBar({ isActive, percent }: { isActive: boolean; percent: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full border border-primary-soft bg-muted">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: "var(--color-tech-blue)" }}
        initial={false}
        animate={{ width: isActive ? `${percent}%` : "0%" }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function HeroLiveBarChart({ isActive }: { isActive: boolean }) {
  const data = useMemo(
    () =>
      LIVE_BAR_DATA.map((row, i) => ({
        ...row,
        v: isActive ? row.v : Math.max(8, row.v * 0.15),
      })),
    [isActive]
  );

  return (
    <ChartContainer
      config={liveBarChartConfig}
      className="h-44 w-full min-h-44 min-w-0 rounded-2xl border border-primary-soft bg-primary-soft/40 p-2 [&_.recharts-responsive-container]:min-h-40"
    >
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 4, right: 4, top: 10, bottom: 4 }}
      >
        <CartesianGrid vertical={false} className="stroke-primary-soft/60" />
        <XAxis
          dataKey="t"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
        />
        <ChartTooltip
          cursor={{ fill: "color-mix(in srgb, var(--color-primary) 8%, transparent)" }}
          content={<ChartTooltipContent hideLabel valueFormatter={(x) => String(x)} />}
        />
        <Bar
          dataKey="v"
          fill="var(--color-v)"
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ChartContainer>
  );
}

function HeroMatchTrendChart({ isActive }: { isActive: boolean }) {
  const gradId = useId().replace(/:/g, "");
  const data = useMemo(
    () =>
      MATCH_TREND_DATA.map((row) => ({
        ...row,
        y: isActive ? row.y : row.y * 0.2,
      })),
    [isActive]
  );

  return (
    <ChartContainer
      config={matchTrendChartConfig}
      className="h-20 w-full min-h-20 min-w-0 [&_.recharts-responsive-container]:min-h-[5rem]"
    >
      <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-tech-blue)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-tech-blue)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="y"
          stroke="var(--color-tech-blue)"
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={isActive}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function AiAnalysisBridge() {
  return (
    <div className="flex min-h-[4.25rem] min-w-0 flex-1 flex-col items-center justify-center gap-2.5 px-0.5">
      <div className="flex w-full max-w-[11rem] items-center sm:max-w-full" aria-hidden>
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: "var(--color-tech-blue)" }}
        />
        <div
          className="mx-2 h-0.5 min-w-0 flex-1 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--color-tech-blue) 0%, color-mix(in srgb, var(--color-tech-blue) 28%, transparent) 58%, transparent 100%)",
          }}
        />
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: "var(--color-tech-blue)" }}
        />
      </div>
      <span
        className="rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-on-dark shadow-sm"
        style={{ backgroundColor: "var(--color-tech-blue)" }}
      >
        Phân tích AI
      </span>
    </div>
  );
}

function SlideAiMatch({ isActive }: { isActive: boolean }) {
  return (
    <div className="relative px-6 pb-14 pt-6 md:px-8 md:pb-16 md:pt-7">
      <span className="text-white pointer-events-none absolute -right-4 -top-3 z-20 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold text-background-dark shadow-xl shadow-primary/25 md:-right-6 md:-top-5">
        Gợi ý hàng đầu
      </span>

      <div className="mb-6 flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex flex-col items-center gap-2 text-center">
          <img
            src={IMG_BRAND}
            alt=""
            className="size-14 rounded-xl border border-primary-soft object-cover md:size-16"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Thương hiệu
          </span>
        </div>

        <AiAnalysisBridge />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="relative shrink-0">
            <img
              src={IMG_CREATOR}
              alt=""
              className="size-14 rounded-full border border-primary-soft object-cover md:size-16"
            />
            <span
              className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full text-[10px] text-white shadow-sm"
              style={{ backgroundColor: "var(--color-success)" }}
              aria-hidden
            >
              ✓
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            Sarah J.
          </span>
        </div>
      </div>

      <div
        className="space-y-3 rounded-2xl border border-primary-soft p-4"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-tech-blue) 12%, var(--color-muted))",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-foreground">Điểm tương thích</p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Theo nhân khẩu & ngách nội dung
            </p>
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-black tabular-nums md:text-3xl"
              style={{ color: "var(--color-tech-blue)" }}
            >
              98%
            </p>
            <p
              className="text-[10px] font-bold uppercase tracking-wide"
              style={{ color: "var(--color-tech-blue)" }}
            >
              Khớp cao
            </p>
          </div>
        </div>
        <AnimatedScoreBar isActive={isActive} percent={98} />
        <HeroMatchTrendChart isActive={isActive} />
        <div className="grid grid-cols-3 gap-2">
          {[
            { k: "Tương tác", v: "8.4%" },
            { k: "Cảm xúc", v: "Tích cực" },
            { k: "Tăng trưởng", v: "+12%" },
          ].map((m) => (
            <div
              key={m.k}
              className="rounded-xl border border-primary-soft bg-card px-2 py-2 text-center shadow-sm"
            >
              <p className="text-[10px] text-foreground-muted">{m.k}</p>
              <p className="text-xs font-bold text-foreground">{m.v}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="absolute -bottom-4 -left-4 flex items-center gap-3.5 rounded-[20px] border border-border/40 bg-card p-3.5 pr-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] sm:-bottom-6 sm:-left-8"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0.55, y: isActive ? 0 : 4 }}
        transition={{ duration: 0.35 }}
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "color-mix(in srgb, var(--color-success) 15%, transparent)" }}
        >
          <TrendingUp className="size-5" style={{ color: "var(--color-success)" }} strokeWidth={2.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 text-left leading-tight">
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            ROI dự kiến
          </p>
          <p className="text-[15px] font-black text-foreground antialiased sm:text-base">Doanh thu ×4.2</p>
        </div>
      </motion.div>
    </div>
  );
}

function SlideLiveMetrics({ isActive }: { isActive: boolean }) {
  return (
    <div className="space-y-5 p-6 md:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Thời gian thực</p>
        <h3 className="mt-1 text-xl font-black text-foreground md:text-2xl">
          Bảng theo dõi chiến dịch
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Cập nhật mỗi vài giây — lượt hiển thị, tương tác và tỉ lệ click.
        </p>
      </div>
      <HeroLiveBarChart isActive={isActive} />
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { k: "Lượt hiển thị", v: "1.2M" },
          { k: "Tương tác", v: "5.8%" },
          { k: "Tỉ lệ click", v: "3.1%" },
        ].map((x) => (
          <div key={x.k} className="flex flex-col justify-center rounded-xl border border-primary/20 bg-background/50 py-3 shadow-sm transition-colors hover:border-primary/40 hover:bg-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{x.k}</p>
            <p className="mt-1 text-lg font-black text-primary">{x.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideSecurePayout({ isActive }: { isActive: boolean }) {
  return (
    <div className="space-y-5 p-6 md:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Thanh toán</p>
        <h3 className="mt-1 text-xl font-black text-foreground md:text-2xl">
          Chi trả an toàn cho creator
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Escrow, đối soát KPI và lịch sử giao dịch minh bạch.
        </p>
      </div>
      <ul className="space-y-3">
        {["Xác minh KPI tự động", "Đa tầng phê duyệt", "Rút tiền 24–48h"].map((t, i) => (
          <motion.li
            key={t}
            className="flex items-center gap-3 rounded-xl border border-primary-soft bg-muted/30 px-4 py-3"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0.45, x: isActive ? 0 : -6 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
          >
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-emerald-600 dark:text-emerald-400"
              style={{ backgroundColor: "color-mix(in srgb, var(--color-success) 18%, transparent)" }}
            >
              <span className="material-symbols-outlined text-lg" style={{ color: "var(--color-success)" }}>
                check_circle
              </span>
            </span>
            <span className="text-sm font-semibold text-foreground">{t}</span>
          </motion.li>
        ))}
      </ul>
      <div className="rounded-2xl bg-primary-soft/60 px-4 py-3 text-center">
        <p className="text-xs text-foreground-muted">Đã chi trả tuần này</p>
        <p className="text-2xl font-black text-primary">12,840,000đ</p>
      </div>
    </div>
  );
}

const SLIDE_RENDERERS = [SlideAiMatch, SlideLiveMetrics, SlideSecurePayout] as const;

export function HeroCardSlideshow() {
  const [active, setActive] = useState(0);

  const tick = useCallback(() => {
    setActive((i) => (i + 1) % SLIDE_COUNT);
  }, []);

  useEffect(() => {
    const id = window.setInterval(tick, AUTO_MS);
    return () => window.clearInterval(id);
  }, [tick]);

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute -top-10 left-0 h-64 w-64 rounded-full bg-primary/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-10 right-0 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />

      <div className="relative mx-auto min-h-[30rem] w-full max-w-88 pb-20 sm:max-w-md md:min-h-[32rem] lg:max-w-lg">
        {SLIDE_RENDERERS.map((Slide, slideIndex) => {
          const stackPos = (slideIndex - active + SLIDE_COUNT) % SLIDE_COUNT;
          const isFront = stackPos === 0;

          return (
            <motion.div
              key={slideIndex}
              className="absolute left-1/2 top-0 w-full max-w-88 -translate-x-1/2 sm:max-w-md lg:max-w-lg"
              style={{ transformOrigin: "50% 0%" }}
              animate={{
                y: stackPos * 16,
                x: stackPos * 5,
                rotate: stackPos * -2.8,
                scale: 1 - stackPos * 0.048,
                opacity: Math.max(0.35, 1 - stackPos * 0.28),
                zIndex: 30 - stackPos * 10,
                filter: stackPos > 0 ? "brightness(0.97)" : "brightness(1)",
              }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
            >
              <div
                className={cn(
                  "overflow-visible rounded-3xl border border-primary-soft bg-card shadow-2xl backdrop-blur-sm",
                  !isFront && "pointer-events-none shadow-lg"
                )}
              >
                <Slide isActive={isFront} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <DotNav active={active} onSelect={setActive} />
    </div>
  );
}
