"use client";

import React from "react";
import { TOP_PERFORMERS } from "@/data/mock-data";
import { useScrollProgress, sub, lerp } from "@/features/landing/components/use-scroll-progress";

const Sym: React.FC<{ children: string; className?: string; style?: React.CSSProperties }> = ({ children, className, style }) => (
  <span className={`material-symbols-outlined ${className ?? ""}`} style={style} aria-hidden>
    {children}
  </span>
);

/**
 * "Sức mạnh" — bento lệch, mỗi lợi ích là một mẩu giao diện social thật.
 * Mọi transform nội suy theo tiến độ cuộn: kéo xuống diễn tiến, kéo lên tua ngược.
 */
export const StageBenefits: React.FC = () => {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const [a, b, c] = [TOP_PERFORMERS[0], TOP_PERFORMERS[1], TOP_PERFORMERS[2]];

  const head = sub(p, 0, 0.3);
  const cardA = sub(p, 0.05, 0.5);
  const cardB = sub(p, 0.15, 0.6);
  const cardC = sub(p, 0.25, 0.7);

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-6">
      <div
        className="mb-10 max-w-xl"
        style={{ opacity: head, transform: `translateY(${lerp(28, 0, head)}px)` }}
      >
        <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Sức mạnh của Hive</h2>
        <h3 className="mt-3 text-4xl font-black leading-tight text-foreground sm:text-5xl">
          Một tổ ong, <span className="shine-text">ba mũi nhọn</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        {/* MATCH — trượt từ trái */}
        <div
          className="landing-card rounded-[1.75rem] p-7 md:col-span-5 md:row-span-2"
          style={{
            opacity: cardA,
            transform: `translateX(${lerp(-64, 0, cardA)}px) rotate(${lerp(-2.5, 0, cardA)}deg)`,
          }}
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-bold text-foreground">
            <Sym className="text-primary" style={{ fontSize: 20 }}>joystick</Sym>
            Ghép đôi thông minh
          </div>
          <div className="space-y-3">
            {[
              { brand: "Cocoon", pct: "97%", who: a },
              { brand: "Nike VN", pct: "92%", who: b },
              { brand: "Vinamilk", pct: "88%", who: c },
            ].map((m, i) => {
              const t = sub(p, 0.3 + i * 0.12, 0.62 + i * 0.12);
              return (
                <div
                  key={m.brand}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3"
                  style={{ opacity: t, transform: `translateY(${lerp(22, 0, t)}px)` }}
                >
                  <img src={m.who.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-foreground">
                      {m.who.name} <span className="font-medium text-foreground-muted">×</span> {m.brand}
                    </div>
                    <div className="text-xs text-foreground-muted">độ phù hợp khán giả</div>
                  </div>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-black text-primary">{m.pct}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ANALYTICS — trượt từ dưới, cột chart mọc theo px */}
        <div
          className="landing-card rounded-[1.75rem] p-7 md:col-span-7"
          style={{ opacity: cardB, transform: `translateY(${lerp(64, 0, cardB)}px)` }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Sym className="text-primary" style={{ fontSize: 20 }}>monitoring</Sym>
              Phân tích thời gian thực
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground-muted">
              <span className="h-2 w-2 rounded-full bg-[#1877F2]" /> FB
              <span className="ml-2 h-2 w-2 rounded-full bg-[#d62976]" /> IG
              <span className="ml-2 h-2 w-2 rounded-full bg-foreground" /> TikTok
            </div>
          </div>
          <div className="flex h-28 items-end gap-2">
            {[38, 52, 44, 66, 58, 84, 100].map((h, i) => {
              const t = sub(p, 0.25 + i * 0.055, 0.6 + i * 0.055);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-primary/35 to-primary"
                  style={{ height: `${lerp(6, h, t)}%` }}
                />
              );
            })}
          </div>
          <div className="mt-3 text-xs font-semibold text-foreground-muted">
            Tương tác 7 ngày · <span className="text-primary">+41%</span>
          </div>
        </div>

        {/* PAYMENT — trượt từ phải */}
        <div
          className="landing-card rounded-[1.75rem] p-7 md:col-span-7"
          style={{
            opacity: cardC,
            transform: `translateX(${lerp(64, 0, cardC)}px) rotate(${lerp(2.5, 0, cardC)}deg)`,
          }}
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
            <Sym className="text-primary" style={{ fontSize: 20 }}>payments</Sym>
            Thanh toán an toàn
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 px-5 py-4">
            <span className="hex-chip" style={{ width: 44, height: 48 }}>
              <Sym style={{ fontSize: 22 }}>verified_user</Sym>
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-foreground">Escrow đã giải ngân — ₫48.000.000</div>
              <div className="text-xs text-foreground-muted">Chiến dịch Tết 2026 · đạt đủ mốc KPI · vừa xong</div>
            </div>
            <Sym className="text-success" style={{ fontSize: 22, opacity: sub(p, 0.6, 0.8) }}>check_circle</Sym>
          </div>
        </div>
      </div>
    </div>
  );
};
