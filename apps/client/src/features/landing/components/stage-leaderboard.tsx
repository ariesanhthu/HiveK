"use client";

import React from "react";
import Link from "next/link";
import { TOP_PERFORMERS } from "@/data/mock-data";
import { useScrollProgress, sub, lerp } from "@/features/landing/components/use-scroll-progress";

/**
 * "Bảng vàng" — bục vinh danh: trụ podium MỌC theo từng px cuộn (kéo lên là
 * hạ xuống), quán quân đứng giữa; phần còn lại là danh sách gọn bên phải.
 */
export const StageLeaderboard: React.FC = () => {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const [first, second, third, ...rest] = TOP_PERFORMERS;

  const podium = [
    { row: second, place: 2, h: 128, at: 0.12 },
    { row: first, place: 1, h: 188, at: 0 },
    { row: third, place: 3, h: 96, at: 0.24 },
  ];

  const head = sub(p, 0, 0.28);

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-6">
      <div
        className="mb-12 flex flex-wrap items-end justify-between gap-4"
        style={{ opacity: head, transform: `translateY(${lerp(28, 0, head)}px)` }}
      >
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Bảng vàng tuần này</h2>
          <h3 className="mt-3 text-4xl font-black leading-tight text-foreground sm:text-5xl">
            Ai đang dẫn sóng?
          </h3>
        </div>
        <Link href="/kol-ranking" className="flex items-center gap-1 font-bold text-primary hover:underline">
          Xem toàn bộ xếp hạng
          <span className="material-symbols-outlined text-sm" aria-hidden>arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-3">
        {/* Podium */}
        <div className="flex items-end justify-center gap-4 lg:col-span-2">
          {podium.map(({ row, place, h, at }) => {
            const grow = sub(p, 0.1 + at, 0.55 + at);   // trụ mọc
            const pop = sub(p, 0.3 + at, 0.7 + at);     // người bước lên bục
            return (
              <div key={row.id} className="flex w-full max-w-[180px] flex-col items-center">
                <Link
                  href={`/kol/${encodeURIComponent(row.id)}`}
                  className="group flex flex-col items-center"
                  style={{
                    opacity: pop,
                    transform: `translateY(${lerp(26, 0, pop)}px) scale(${lerp(0.82, 1, pop)})`,
                  }}
                >
                  {place === 1 && (
                    <span
                      className="material-symbols-outlined mb-1 text-[26px] text-primary"
                      style={{ transform: `rotate(${lerp(-30, 0, pop)}deg)` }}
                      aria-hidden
                    >
                      crown
                    </span>
                  )}
                  <img
                    src={row.avatar}
                    alt={`Chân dung ${row.name}`}
                    className={`rounded-full border-2 object-cover transition-transform group-hover:scale-105 ${
                      place === 1 ? "h-20 w-20 border-primary" : "h-14 w-14 border-primary/40"
                    }`}
                  />
                  <div className="mt-2 max-w-full truncate text-sm font-bold text-foreground group-hover:text-primary">
                    {row.name}
                  </div>
                  <div className="text-xs text-foreground-muted">{row.followers} follow · {row.engagement}</div>
                </Link>
                <div
                  className="mt-3 flex w-full items-start justify-center overflow-hidden rounded-t-2xl border border-b-0 border-primary/25 bg-gradient-to-t from-primary/5 to-primary/20 pt-3 text-2xl font-black text-primary/80"
                  style={{ height: lerp(0, h, grow), opacity: grow > 0 ? 1 : 0 }}
                >
                  {place}
                </div>
              </div>
            );
          })}
        </div>

        {/* Danh sách kế tiếp */}
        <div className="space-y-3 self-center">
          {rest.slice(0, 2).map((row, i) => {
            const t = sub(p, 0.45 + i * 0.12, 0.8 + i * 0.12);
            return (
              <Link
                key={row.id}
                href={`/kol/${encodeURIComponent(row.id)}`}
                className="landing-card group flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:border-primary/40"
                style={{ opacity: t, transform: `translateX(${lerp(48, 0, t)}px)` }}
              >
                <span className="w-6 text-center text-sm font-black text-foreground-muted">{i + 4}</span>
                <img src={row.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-foreground group-hover:text-primary">{row.name}</div>
                  <div className="truncate text-xs text-foreground-muted">{row.category}</div>
                </div>
                <span className="text-xs font-bold text-foreground">{row.followers}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
