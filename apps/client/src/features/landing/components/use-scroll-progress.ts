"use client";

import { useEffect, useRef, useState } from "react";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Cắt một khúc [start, end] của tiến độ tổng thành tiến độ con 0→1 (stagger). */
export const sub = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

/**
 * Tiến độ cuộn 0→1 của một phần tử — kéo xuống diễn tiến, kéo lên tua ngược.
 *
 * - Đo: p=0 khi mép trên phần tử ở `from`×viewport (mặc định 0.85 — section
 *   phải LÓ RA rồi mới bắt đầu diễn), p=1 khi chạm `to`×viewport (0.15).
 * - Có QUÁN TÍNH: giá trị hiển thị đuổi theo giá trị thật bằng damping mỗi
 *   frame, nên kể cả khi scroll-snap nhảy vèo một đoạn dài, animation vẫn
 *   diễn từ tốn (~1s) thay vì "0.3s xong toàn bộ".
 * - prefers-reduced-motion → luôn 1 (trạng thái hoàn chỉnh, tĩnh).
 */
export function useScrollProgress<T extends HTMLElement>(from = 0.85, to = 0.15) {
  const ref = useRef<T | null>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setP(1);
      return;
    }

    let raf = 0;
    let running = false;
    let current = 0;
    let target = 0;

    const measure = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      target = clamp01((vh * from - r.top) / (vh * from - vh * to));
    };

    // Vòng damping: current đuổi theo target, ~1s để khép 95% khoảng cách.
    const tick = () => {
      current += (target - current) * 0.055;
      if (Math.abs(target - current) < 0.001) {
        current = target;
        running = false;
      } else {
        raf = requestAnimationFrame(tick);
      }
      setP(current);
    };
    const kick = () => {
      measure();
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
    };
  }, [from, to]);

  return { ref, p };
}
