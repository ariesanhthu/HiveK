"use client";

import React from "react";
import Link from "next/link";
import { ACTIVE_CAMPAIGNS } from "@/data/mock-data";
import { useScrollProgress, sub, lerp } from "@/features/landing/components/use-scroll-progress";

/**
 * "Chiến dịch" — ba lá bài XÒE dần theo từng px cuộn từ tư thế úp chồng;
 * kéo ngược thì gập lại. Hover lá bài đứng thẳng dậy.
 */
export const StageCampaigns: React.FC = () => {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const cards = ACTIVE_CAMPAIGNS.slice(0, 3);
  const fan = [
    { r: -8, x: -240, y: 26 },
    { r: 0, x: 0, y: 0 },
    { r: 8, x: 240, y: 26 },
  ];

  const head = sub(p, 0, 0.28);
  const cta = sub(p, 0.6, 0.9);

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-6 text-center">
      <div style={{ opacity: head, transform: `translateY(${lerp(28, 0, head)}px)` }}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Chiến dịch đang mở</h2>
        <h3 className="mt-3 text-4xl font-black leading-tight text-foreground sm:text-5xl">
          Chọn một lá bài, <span className="shine-text">bắt đầu thương vụ</span>
        </h3>
      </div>

      {/* Sàn xòe bài */}
      <div className="relative mx-auto h-[400px] max-w-4xl [perspective:1200px]">
        {cards.map((c, i) => {
          const t = sub(p, 0.12 + i * 0.07, 0.62 + i * 0.07);
          return (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="group absolute left-1/2 top-6 w-[280px]"
              style={{
                zIndex: i === 1 ? 3 : 2,
                opacity: sub(p, 0.05, 0.3),
                transform: `translateX(calc(-50% + ${lerp(0, fan[i].x, t)}px)) translateY(${lerp(60, fan[i].y, t)}px) rotate(${lerp(0, fan[i].r, t)}deg)`,
              }}
            >
              <article className="landing-card overflow-hidden rounded-3xl text-left shadow-2xl transition-transform duration-500 group-hover:-translate-y-4 group-hover:scale-[1.03]">
                <div className="relative h-40 overflow-hidden">
                  <img src={c.image} alt={c.title} className="h-full w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                    {c.category}
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="line-clamp-2 text-base font-bold leading-snug text-foreground group-hover:text-primary">
                    {c.title}
                  </h4>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Ngân sách</div>
                      <div className="text-sm font-black text-primary">{c.priceRange}</div>
                    </div>
                    <span className="material-symbols-outlined text-primary transition-transform group-hover:translate-x-1" aria-hidden>
                      arrow_forward
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-7 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-background-dark"
        style={{ opacity: cta, transform: `translateY(${lerp(20, 0, cta)}px)` }}
      >
        Xem tất cả chiến dịch
        <span className="material-symbols-outlined text-base" aria-hidden>arrow_forward</span>
      </Link>
    </div>
  );
};
