"use client";

import Link from "next/link";
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
  if (badge === "Ưu tú") return "success";
  if (badge === "Top 10") return "warning";
  return "default";
}

function RankDelta({ rank, previousRank }: { rank: number; previousRank: number }) {
  const delta = previousRank - rank;
  if (delta === 0) {
    return <span className="text-xs text-foreground-muted">Không đổi</span>;
  }

  return (
    <span
      className={delta > 0 ? "text-xs text-success" : "text-xs text-rose-500"}
    >
      {delta > 0 ? `▲ +${delta}` : `▼ ${delta}`}
    </span>
  );
}

function KolAvatar({ src, fallback }: { src: string; fallback: string }) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError || !src) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-full border border-primary-soft object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export function KolRankingTable({ items }: KolRankingTableProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-primary-soft bg-card p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">Không tìm thấy creator nào</h3>
        <p className="mt-2 text-sm text-foreground-muted">
          Thử thay đổi bộ lọc để xem thêm kết quả.
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
              <th className="px-4 py-3">Hạng</th>
              <th className="px-4 py-3">Creator</th>
              <th className="px-4 py-3">Lĩnh vực</th>
              <th className="px-4 py-3">Nền tảng</th>
              <th className="px-4 py-3">Người theo dõi</th>
              <th className="px-4 py-3">Đánh giá</th>
              <th className="px-4 py-3">Điểm số</th>
              <th className="px-4 py-3">Huy hiệu</th>
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
                  <Link
                    href={`/kol/${encodeURIComponent(item.id)}`}
                    title="Xem hồ sơ KOL"
                    className="group flex max-w-xs items-center gap-3 rounded-xl py-0.5 outline-none ring-offset-2 ring-offset-card transition-colors hover:bg-primary-soft/40 focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <KolAvatar src={item.avatarUrl} fallback={item.avatarText} />
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary group-hover:underline">
                        {item.name}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        ER {item.engagementRate.toFixed(1)}% · Xem chi tiết
                      </p>
                    </div>
                  </Link>
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
