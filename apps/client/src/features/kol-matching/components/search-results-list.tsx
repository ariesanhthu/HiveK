"use client";

import type { KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchResultsFiltersPanel } from "@/features/kol-matching/components/search-results-filters-panel";
import { useSearchResultsFilters } from "@/features/kol-matching/hooks/use-search-results-filters";
import { type KolCandidate } from "@/features/kol-matching/types";

type SearchResultsListProps = {
  candidates: KolCandidate[];
  selectedCandidateIds: string[];
  onToggleCandidate: (candidateId: string) => void;
  onInviteSelected: () => void;
};

function formatFollowers(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function toDisplayPlatform(platform: KolCandidate["platform"]): string {
  if (platform === "tiktok") return "TikTok";
  if (platform === "instagram") return "Instagram";
  return "YouTube";
}

function handleCardKeyDown(
  event: KeyboardEvent<HTMLElement>,
  candidateId: string,
  onToggle: (id: string) => void
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onToggle(candidateId);
  }
}

export function SearchResultsList({
  candidates: sourceCandidates,
  selectedCandidateIds,
  onToggleCandidate,
  onInviteSelected,
}: SearchResultsListProps) {
  const {
    filters,
    filteredCandidates,
    clearFilters,
    togglePlatform,
    toggleNiche,
    setFollowerMinK,
    setEngagementMinPercent,
  } = useSearchResultsFilters(sourceCandidates);

  const selectedCount = selectedCandidateIds.length;
  const canInvite = selectedCount > 0;

  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <SearchResultsFiltersPanel
        filters={filters}
        onClearAll={clearFilters}
        onTogglePlatform={togglePlatform}
        onToggleNiche={toggleNiche}
        onFollowerMinKChange={setFollowerMinK}
        onEngagementMinChange={setEngagementMinPercent}
      />

      <div className="space-y-3">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
            <div className="min-w-0 flex-1">
              <CardTitle>Kết quả Tìm kiếm KOL</CardTitle>
              <CardDescription>
                Nhấp vào thẻ để chọn (tối đa 3). Chọn ít nhất 2 creator để so sánh.
              </CardDescription>
            </div>
            <button
              type="button"
              onClick={onInviteSelected}
              disabled={!canInvite}
              className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background-dark transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              Mời người đã chọn
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredCandidates.length === 0 ? (
              <p className="rounded-xl border border-primary-soft bg-muted px-4 py-6 text-center text-sm text-foreground-muted">
                Không có creator nào phù hợp với bộ lọc. Thử xóa bộ lọc hoặc mở rộng khoảng tìm kiếm.
              </p>
            ) : null}

            {filteredCandidates.map((candidate) => {
              const isSelected = selectedCandidateIds.includes(candidate.id);

              return (
                <article
                  key={candidate.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${candidate.name}, ${isSelected ? "selected" : "not selected"}. Click to toggle.`}
                  onClick={() => onToggleCandidate(candidate.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, candidate.id, onToggleCandidate)}
                  className={`cursor-pointer rounded-2xl border p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? "border-primary bg-primary-soft ring-2 ring-primary/30"
                      : "border-primary-soft bg-card hover:bg-primary-soft"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted text-xl font-bold text-primary">
                        {candidate.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-foreground">{candidate.name}</p>
                          <Badge variant={candidate.type === "KOL" ? "warning" : "secondary"}>
                            {candidate.type}
                          </Badge>
                          {isSelected ? (
                            <Badge variant="success">Đã chọn</Badge>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-foreground-muted">
                          {toDisplayPlatform(candidate.platform)} • {candidate.niche}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="success">{candidate.fitScore}% Phù hợp</Badge>
                          <span className="text-xs text-foreground-muted">
                            Người theo dõi{" "}
                            <strong className="text-foreground">
                              {formatFollowers(candidate.followers)}
                            </strong>
                          </span>
                          <span className="text-xs text-foreground-muted">
                            Tương tác{" "}
                            <strong className="text-foreground">
                              {candidate.engagementRate.toFixed(1)}%
                            </strong>
                          </span>
                          <span className="text-xs text-foreground-muted">
                            Đánh giá{" "}
                            <strong className="text-foreground">{candidate.avgRoi.toFixed(1)}</strong>
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Phù hợp tệp khán giả
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Phù hợp ngân sách
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      className="rounded-lg border border-primary-soft bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary-soft"
                    >
                      Xem Hồ sơ
                    </button>
                  </div>
                </article>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-soft pt-3">
              <p className="text-xs text-foreground-muted">
                Đã chọn: {selectedCount} / 3 • Đang hiển thị {filteredCandidates.length} trên{" "}
                {sourceCandidates.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
