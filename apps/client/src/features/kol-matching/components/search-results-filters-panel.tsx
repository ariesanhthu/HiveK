"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ENGAGEMENT_THRESHOLD_OPTIONS,
  FOLLOWER_MIN_K_MAX,
  FOLLOWER_MIN_K_STEP,
  SEARCH_NICHE_FILTER_OPTIONS,
  SEARCH_PLATFORM_OPTIONS,
} from "@/features/kol-matching/services/search-results-filter-service";
import { type SearchResultsFilterState, type SocialPlatform } from "@/features/kol-matching/types";

type SearchResultsFiltersPanelProps = {
  filters: SearchResultsFilterState;
  onClearAll: () => void;
  onTogglePlatform: (platform: SocialPlatform) => void;
  onToggleNiche: (nicheId: string) => void;
  onFollowerMinKChange: (value: number) => void;
  onEngagementMinChange: (value: number) => void;
};

export function SearchResultsFiltersPanel({
  filters,
  onClearAll,
  onTogglePlatform,
  onToggleNiche,
  onFollowerMinKChange,
  onEngagementMinChange,
}: SearchResultsFiltersPanelProps) {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filters</CardTitle>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
            Platform
          </p>
          <div className="flex flex-wrap gap-2">
            {SEARCH_PLATFORM_OPTIONS.map(({ id, label }) => {
              const isActive = filters.platforms.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTogglePlatform(id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    isActive
                      ? "bg-primary text-background-dark"
                      : "bg-muted text-foreground-muted hover:bg-primary-soft"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-foreground-muted">Empty = all platforms</p>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
            Niche
          </p>
          <div className="space-y-1.5">
            {SEARCH_NICHE_FILTER_OPTIONS.map((option) => {
              const isActive = filters.nicheIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onToggleNiche(option.id)}
                  className={`flex w-full items-center rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors ${
                    isActive
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-primary-soft bg-card text-foreground-muted hover:bg-muted"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
              Min. followers
            </p>
            <span className="text-xs font-semibold text-primary">
              {filters.followerMinK === 0 ? "Any" : `${filters.followerMinK}k+`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={FOLLOWER_MIN_K_MAX}
            step={FOLLOWER_MIN_K_STEP}
            value={filters.followerMinK}
            onChange={(event) => onFollowerMinKChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary-soft accent-primary"
          />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
            Engagement rate
          </p>
          <select
            value={filters.engagementMinPercent}
            onChange={(event) => onEngagementMinChange(Number(event.target.value))}
            className="w-full rounded-lg border border-primary-soft bg-muted px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
          >
            {ENGAGEMENT_THRESHOLD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
