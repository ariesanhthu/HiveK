"use client";

import React from "react";
import Link from "next/link";
import { TOP_PERFORMERS } from "@/data/mock-data";
import { AUTH_ROUTES } from "@/features/auth/constants";
import { useScrollProgress, sub, lerp } from "@/features/landing/components/use-scroll-progress";

/**
 * "Gia nhập" — lời chứng thực kể bằng một thread DM: bong bóng chat nở dần
 * theo từng px cuộn (kéo ngược thì thu lại), CTA vào sau cùng.
 */
export const StageJoin: React.FC = () => {
  const { ref, p } = useScrollProgress<HTMLDivElement>();
  const creator = TOP_PERFORMERS[0];

  const bubble = (i: number, from: "left" | "right"): React.CSSProperties => {
    const t = sub(p, 0.08 + i * 0.14, 0.4 + i * 0.14);
    return {
      opacity: t,
      transform: `translateX(${lerp(from === "left" ? -26 : 26, 0, t)}px) scale(${lerp(0.9, 1, t)})`,
    };
  };
  const card = sub(p, 0, 0.35);
  const cta = sub(p, 0.35, 0.75);

  return (
    <div ref={ref} className="mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
        {/* Thread DM */}
        <div
          className="landing-card mx-auto w-full max-w-md rounded-3xl p-6"
          style={{ opacity: card, transform: `translateY(${lerp(40, 0, card)}px)` }}
        >
          <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
            <img src={creator.avatar} alt={`Chân dung ${creator.name}`} className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-foreground">{creator.name}</div>
              <div className="text-xs text-foreground-muted">{creator.followers} người theo dõi</div>
            </div>
            <span className="material-symbols-outlined ml-auto text-primary" style={{ fontSize: 18 }} aria-hidden>
              verified
            </span>
          </div>

          <div className="space-y-3">
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-relaxed text-foreground" style={bubble(0, "left")}>
              Trước đây tôi mất cả buổi tối trả lời tin nhắn trên ba nền tảng 😮‍💨
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-3 text-sm leading-relaxed text-foreground" style={bubble(1, "left")}>
              Giờ Hive-K trả lời thay tôi 🎬
            </div>
            <div className="ml-auto flex max-w-[85%] flex-col items-end gap-1" style={bubble(2, "right")}>
              <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm font-medium leading-relaxed text-background-dark">
                Tuần này AI đã xử lý 214 hội thoại cho bạn 🐝
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-success">
                <span className="material-symbols-outlined" style={{ fontSize: 13 }} aria-hidden>done_all</span>
                Hive-K AI
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="text-center lg:text-left"
          style={{ opacity: cta, transform: `translateY(${lerp(36, 0, cta)}px)` }}
        >
          <h2 className="text-4xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
            Đến lượt bạn <span className="shine-text">lên sóng</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
            <Link
              href={AUTH_ROUTES.SIGN_IN}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-9 py-4 text-lg font-bold text-background-dark transition-transform hover:scale-[1.03]"
            >
              Bắt đầu miễn phí
              <span className="material-symbols-outlined" aria-hidden>arrow_forward</span>
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center rounded-full border border-border px-9 py-4 text-lg font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Khám phá chiến dịch
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-3">
              {TOP_PERFORMERS.slice(0, 3).map((per, i) => (
                <img key={i} src={per.avatar} alt="" className="h-9 w-9 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <p className="text-sm font-medium text-foreground-muted">2.000+ creator đã vào tổ</p>
          </div>
        </div>
      </div>
    </div>
  );
};
