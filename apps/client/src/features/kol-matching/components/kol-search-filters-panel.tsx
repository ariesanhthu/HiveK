"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ENGAGEMENT_THRESHOLD_OPTIONS,
  NICHE_FILTER_GROUPS,
  followerSliderToMinFollowers,
  type KolSearchFiltersState,
} from "@/features/kol-matching/services/kol-search-filter";
import { type SocialPlatform } from "@/features/kol-matching/types";

const PLATFORMS: { key: SocialPlatform; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube", label: "YouTube" },
];

type KolSearchFiltersPanelProps = {
  filters: KolSearchFiltersState;
  followerSliderValue: number;
  onTogglePlatform: (platform: SocialPlatform) => void;
  onToggleNicheGroup: (groupId: string) => void;
  onFollowerSliderChange: (value: number) => void;
  onEngagementChange: (value: number) => void;
  onClearAll: () => void;
};

function formatFollowerMinLabel(minFollowers: number): string {
  if (minFollowers <= 0) return "Any";
  if (minFollowers >= 1_000_000) return `${(minFollowers / 1_000_000).toFixed(1)}M+`;
  if (minFollowers >= 1_000) return `${Math.round(minFollowers / 1_000)}K+`;
  return `${minFollowers}+`;
}

export function KolSearchFiltersPanel({
  filters,
  followerSliderValue,
  onTogglePlatform,
  onToggleNicheGroup,
  onFollowerSliderChange,
  onEngagementChange,
  onClearAll,
}: KolSearchFiltersPanelProps) {
  const minFollowers = followerSliderToMinFollowers(followerSliderValue);

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
            {PLATFORMS.map(({ key, label }) => {
              const isSelected =
                filters.platformKeys.length > 0 && filters.platformKeys.includes(key);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onTogglePlatform(key)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    isSelected
                      ? "bg-primary text-background-dark"
                      : "bg-muted text-foreground-muted hover:bg-primary-soft"
                  )}
                  title={
                    filters.platformKeys.length === 0
                      ? "Tap to filter by this platform"
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
          {filters.platformKeys.length === 0 ? (
            <p className="text-[10px] text-foreground-muted">All platforms. Tap one to narrow.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
            Niche
          </p>
          <div className="flex flex-col gap-1.5">
            {NICHE_FILTER_GROUPS.map((group) => {
              const isSelected = filters.nicheGroupIds.includes(group.id);
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => onToggleNicheGroup(group.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                    isSelected
                      ? "border-primary bg-primary-soft font-semibold text-foreground"
                      : "border-primary-soft text-foreground-muted hover:bg-primary-soft/50"
                  )}
                >
                  {group.label}
                </button>
              );
            })}
          </div>
          {filters.nicheGroupIds.length === 0 ? (
            <p className="text-[10px] text-foreground-muted">All niches. Select to filter.</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
              Min. followers
            </p>
            <span className="text-xs font-semibold text-primary">
              {formatFollowerMinLabel(minFollowers)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={followerSliderValue}
            onChange={(event) => onFollowerSliderChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary-soft accent-primary"
            aria-label="Minimum followers"
          />
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
            Engagement rate
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ENGAGEMENT_THRESHOLD_OPTIONS.map((threshold) => {
              const isActive = filters.minEngagementPercent === threshold;
              const label =
                threshold === 0 ? "Any" : `≥ ${threshold}%`;
              return (
                <button
                  key={threshold}
                  type="button"
                  onClick={() => onEngagementChange(threshold)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    isActive
                      ? "border-primary bg-primary text-background-dark"
                      : "border-primary-soft bg-muted text-foreground hover:bg-primary-soft"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
