"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const RADAR_DATA = [
  { axis: "Tương tác", score: 88 },
  { axis: "Uy tín", score: 92 },
  { axis: "Tăng trưởng", score: 74 },
  { axis: "An toàn ND", score: 95 },
  { axis: "Nhất quán", score: 80 },
];

const ROWS = [
  { name: "MixiGaming", handle: "@mixigaming3con", niche: "Gaming", followers: "8.2M", er: "8.4%", risk: "Thấp", score: 91 },
  { name: "Tinh Tế", handle: "@tinhte", niche: "Công nghệ", followers: "3.2M", er: "7.8%", risk: "Thấp", score: 89 },
  { name: "Giang Ơi", handle: "@GiangOi", niche: "Đời sống", followers: "2.2M", er: "9.2%", risk: "TB", score: 85 },
];

const RISK_CLASS: Record<string, string> = {
  "Thấp": "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "TB": "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export function AnalysisReplica() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      <div className="rounded-2xl border border-primary-soft bg-card p-4 md:col-span-2">
        <p className="mb-1 text-xs font-bold text-foreground">Hồ sơ điểm số</p>
        <p className="mb-2 text-[10px] text-foreground-muted">Sun HT · @SunHT</p>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={RADAR_DATA} outerRadius="72%">
              <PolarGrid stroke="var(--color-foreground-muted)" strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 9, fill: "var(--color-foreground-muted)" }} />
              <Radar
                dataKey="score"
                stroke="var(--color-creator-purple)"
                fill="var(--color-creator-purple)"
                fillOpacity={0.35}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-soft bg-card p-4 md:col-span-3">
        <p className="mb-3 text-xs font-bold text-foreground">Xếp hạng & mức độ rủi ro</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-foreground-muted">
                <th className="pb-2 font-bold">Creator</th>
                <th className="pb-2 font-bold">Ngách</th>
                <th className="pb-2 font-bold">Followers</th>
                <th className="pb-2 font-bold">Rủi ro</th>
                <th className="pb-2 text-right font-bold">Điểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-soft">
              {ROWS.map((r) => (
                <tr key={r.handle}>
                  <td className="py-2">
                    <p className="font-bold text-foreground">{r.name}</p>
                    <p className="text-[10px] text-foreground-muted">{r.handle}</p>
                  </td>
                  <td className="py-2 text-foreground-muted">{r.niche}</td>
                  <td className="py-2 text-foreground-muted">{r.followers}</td>
                  <td className="py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${RISK_CLASS[r.risk]}`}>
                      {r.risk}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-creator-purple"
                          style={{ width: `${r.score}%`, backgroundColor: "var(--color-creator-purple)" }}
                        />
                      </div>
                      <span className="font-black text-foreground">{r.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
