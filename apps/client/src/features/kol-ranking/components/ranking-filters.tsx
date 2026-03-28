"use client";

import React from "react";
import {
  FOLLOWER_RANGE_OPTIONS,
  KOL_NICHES,
  KOL_PLATFORMS,
  type FollowerRange,
  type KolNiche,
  type KolPlatform,
  type KolRankingFilters,
} from "@/features/kol-ranking/types";

type RankingFiltersProps = {
  filters: KolRankingFilters;
  onChange: (nextFilters: Partial<KolRankingFilters>) => void;
};

export function RankingFilters({ filters, onChange }: RankingFiltersProps) {
  return (
    <section className="rounded-2xl border border-primary-soft bg-card p-4 shadow-sm md:p-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Tìm kiếm
          </span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Tìm kiếm tên KOL..."
            className="rounded-xl border border-primary-soft bg-muted px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Lĩnh vực
          </span>
          <select
            value={filters.niche}
            onChange={(event) =>
              onChange({ niche: event.target.value as KolNiche | "all" })
            }
            className="rounded-xl border border-primary-soft bg-muted px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          >
            <option value="all">Tất cả lĩnh vực</option>
            {KOL_NICHES.map((niche) => (
              <option key={niche} value={niche}>
                {niche}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Nền tảng
          </span>
          <select
            value={filters.platform}
            onChange={(event) =>
              onChange({ platform: event.target.value as KolPlatform | "all" })
            }
            className="rounded-xl border border-primary-soft bg-muted px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          >
            <option value="all">Tất cả nền tảng</option>
            {KOL_PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground-muted">
            Người theo dõi
          </span>
          <select
            value={filters.followerRange}
            onChange={(event) =>
              onChange({
                followerRange: event.target.value as FollowerRange,
              })
            }
            className="rounded-xl border border-primary-soft bg-muted px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
          >
            {FOLLOWER_RANGE_OPTIONS.map((range) => (
              <option key={range} value={range}>
                {range === "all" ? "Tất cả khoảng" : range}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
