"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const KPIS = [
  { label: "Chiến dịch đang chạy", value: "18", trend: "+3 tuần này", icon: "campaign" },
  { label: "Tổng ngân sách", value: "1.4 tỷ đ", trend: "+12%", icon: "payments" },
  { label: "Creator hợp tác", value: "64", trend: "+8 mới", icon: "groups" },
  { label: "Tỉ lệ hoàn thành", value: "94%", trend: "ổn định", icon: "task_alt" },
];

const PERF_DATA = [
  { t: "T2", v: 40 }, { t: "T3", v: 55 }, { t: "T4", v: 48 },
  { t: "T5", v: 70 }, { t: "T6", v: 62 }, { t: "T7", v: 85 }, { t: "CN", v: 78 },
];

const CONVERT_DATA = [
  { t: "Tuần 1", v: 20 }, { t: "Tuần 2", v: 34 }, { t: "Tuần 3", v: 28 }, { t: "Tuần 4", v: 45 },
];

const ACTIVITIES = [
  { title: "Chiến dịch \"Glow Summer\" cần duyệt", time: "5 phút trước", status: "Chờ duyệt", tone: "warning" as const },
  { title: "Sun HT đã đăng bài TikTok", time: "22 phút trước", status: "Đang chạy", tone: "success" as const },
  { title: "Thanh toán #INV-2291 đã hoàn tất", time: "1 giờ trước", status: "Đã trả", tone: "default" as const },
];

const TONE_CLASS: Record<string, string> = {
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  default: "border-primary-soft bg-muted text-foreground-muted",
};

export function DashboardReplica() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-2xl border border-primary-soft bg-card p-3">
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-base text-primary" aria-hidden>
                {k.icon}
              </span>
            </div>
            <p className="mt-2 text-lg font-black text-foreground">{k.value}</p>
            <p className="truncate text-[10px] font-medium text-foreground-muted">{k.label}</p>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{k.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-primary-soft bg-primary-soft/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-foreground">Hiệu suất chiến dịch</p>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              +12%
            </span>
          </div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERF_DATA} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" strokeWidth={2} fill="url(#perfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-primary-soft bg-primary-soft/40 p-4">
          <p className="mb-2 text-xs font-bold text-foreground">Xu hướng chuyển đổi</p>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONVERT_DATA} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeOpacity={0.15} />
                <XAxis dataKey="t" tickLine={false} axisLine={false} tick={{ fontSize: 9 }} />
                <Bar dataKey="v" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-soft bg-card p-4">
        <p className="mb-3 text-xs font-bold text-foreground">Hoạt động gần đây</p>
        <div className="divide-y divide-primary-soft">
          {ACTIVITIES.map((a) => (
            <div key={a.title} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                <span className="material-symbols-outlined text-sm text-primary" aria-hidden>
                  notifications
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{a.title}</p>
                <p className="text-[10px] text-foreground-muted">{a.time}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TONE_CLASS[a.tone]}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
