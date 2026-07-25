"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STAGES = [
  { label: "Phân tích yêu cầu chiến dịch", status: "done" as const },
  { label: "Quét hồ sơ 12,400+ Cộng tác viên", status: "done" as const },
  { label: "Chấm điểm tương thích bằng AI", status: "active" as const },
  { label: "Xếp hạng & đề xuất top ứng viên", status: "pending" as const },
];

const CANDIDATES = [
  { name: "Sun HT", handle: "@SunHT", type: "CTV", match: 98, followers: "1.2M", er: "9.8%" },
  { name: "Giang Ơi", handle: "@GiangOi", type: "CTV", match: 92, followers: "2.2M", er: "9.2%" },
  { name: "Vy Vy Food", handle: "@vyvyfood", type: "Gia sư", match: 87, followers: "340K", er: "11.4%" },
];

export function AiMatchingReplica() {
  const [progress, setProgress] = useState(64);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setProgress(100), 500);
    const r = setTimeout(() => setRevealed(true), 1400);
    return () => {
      clearTimeout(t);
      clearTimeout(r);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      <div className="rounded-2xl border border-primary-soft bg-card p-4 md:col-span-2">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-primary-soft">
          <span className="material-symbols-outlined text-primary" aria-hidden>
            auto_awesome
          </span>
        </div>
        <p className="text-center text-sm font-bold text-foreground">
          Đang phân tích yêu cầu
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] font-bold text-primary">{progress}%</p>

        <ul className="mt-4 space-y-2.5">
          {STAGES.map((s) => (
            <li key={s.label} className="flex items-center gap-2.5">
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] ${
                  s.status === "done"
                    ? "bg-emerald-500/15 text-emerald-600"
                    : s.status === "active"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-foreground-muted"
                }`}
              >
                <span className="material-symbols-outlined text-xs" aria-hidden>
                  {s.status === "done" ? "check" : s.status === "active" ? "sync" : "schedule"}
                </span>
              </span>
              <span className="text-xs font-medium text-foreground-muted">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-primary-soft bg-card p-4 md:col-span-3">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-foreground-muted">
          Đề xuất phù hợp nhất
        </p>
        <div className="space-y-2.5">
          {CANDIDATES.map((c, i) => (
            <motion.div
              key={c.handle}
              initial={{ opacity: 0, y: 6 }}
              animate={revealed ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.35 }}
              className="flex items-center gap-3 rounded-xl border border-primary-soft p-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-black text-primary">
                {c.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                  <span className="rounded-full border border-primary-soft bg-muted px-1.5 py-0.5 text-[9px] font-bold text-foreground-muted">
                    {c.type}
                  </span>
                </div>
                <p className="text-[11px] text-foreground-muted">
                  {c.handle} · {c.followers} · ER {c.er}
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-black text-emerald-700 dark:text-emerald-300">
                {c.match}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
