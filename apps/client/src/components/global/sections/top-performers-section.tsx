import React from "react";
import { TOP_PERFORMERS } from "@/data/mock-data";

export const TopPerformersSection: React.FC = () => {
  return (
    <section id="influencers" className="py-24" aria-labelledby="top-performers-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2
              id="top-performers-heading"
              className="text-3xl font-black text-foreground"
            >
              KOL Nổi bật
            </h2>
            <p className="mt-2 text-muted">
              Những nhà sáng tạo có ảnh hưởng nhất tuần này
            </p>
          </div>
          <a
            href="/kol-ranking"
            className="flex items-center gap-1 font-bold text-primary hover:underline"
          >
            Xem toàn bộ bảng xếp hạng
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-soft bg-card shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-primary/5 text-sm font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="hidden px-6 py-4 md:table-cell">
                  Tỷ lệ tương tác
                </th>
                <th className="px-6 py-4">Người theo dõi</th>
                <th className="px-6 py-4 text-right">Xu hướng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-soft">
              {TOP_PERFORMERS.map((row) => (
                <tr
                  key={row.handle}
                  className="transition-colors hover:bg-primary/5"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={row.avatar}
                        alt={`Portrait of ${row.name}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-foreground">
                          {row.name}
                        </div>
                        <div className="text-xs text-muted">
                          {row.handle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground-muted">
                    {row.category}
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${row.engagementPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{row.engagement}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">
                    {row.followers}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`material-symbols-outlined ${
                        row.trend === "up"
                          ? "text-success"
                          : "text-primary"
                      }`}
                    >
                      {row.trend === "up" ? "trending_up" : "trending_flat"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

