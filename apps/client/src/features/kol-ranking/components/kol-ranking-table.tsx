"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { type KolBadge, type KolRankingItem } from "@/features/kol-ranking/types";

type KolRankingTableProps = {
  items: KolRankingItem[];
};

function formatFollowers(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function badgeVariantFromType(badge: KolBadge): "success" | "warning" | "default" {
  if (badge === "Elite") return "success";
  if (badge === "Top 10") return "warning";
  return "default";
}

function RankDelta({ rank, previousRank }: { rank: number; previousRank: number }) {
  const delta = previousRank - rank;
  if (delta === 0) {
    return <span className="text-xs text-foreground-muted">No change</span>;
  }

  return (
    <span
      className={delta > 0 ? "text-xs text-success" : "text-xs text-rose-500"}
    >
      {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
    </span>
  );
}

export function KolRankingTable({ items }: KolRankingTableProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-primary-soft bg-card p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">No creators found</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Thử đổi filter để mở rộng kết quả.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-primary-soft bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-primary-soft">
          <thead className="bg-primary-soft">
            <tr className="text-left text-xs uppercase tracking-wide text-foreground-muted">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Creator</th>
              <th className="px-4 py-3">Niche</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Followers</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Badge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-soft">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-primary-soft/30">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold text-foreground">#{item.rank}</p>
                    <RankDelta rank={item.rank} previousRank={item.previousRank} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                      {item.avatarText}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-foreground-muted">
                        ER {item.engagementRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">{item.niche}</td>
                <td className="px-4 py-3 text-sm text-foreground">{item.platform}</td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {formatFollowers(item.followers)}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {item.rating.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">
                  {item.score.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={badgeVariantFromType(item.badge)}>{item.badge}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
