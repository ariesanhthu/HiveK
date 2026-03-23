import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type KolCandidate } from "@/features/kol-matching/types";

type SearchResultsListProps = {
  candidates: KolCandidate[];
  selectedCandidateIds: string[];
  onToggleCandidate: (candidateId: string) => void;
  onCompare: () => void;
  onRestart: () => void;
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

export function SearchResultsList({
  candidates,
  selectedCandidateIds,
  onToggleCandidate,
  onCompare,
  onRestart,
}: SearchResultsListProps) {
  return (
    <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Filters</CardTitle>
            <button type="button" className="text-xs font-semibold text-primary hover:underline">
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
              <button type="button" className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-background-dark">
                Instagram
              </button>
              <button type="button" className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground-muted">
                TikTok
              </button>
              <button type="button" className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground-muted">
                YouTube
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
              Niche
            </p>
            <div className="space-y-1.5 text-xs text-foreground-muted">
              <p className="font-semibold text-foreground">Beauty & Lifestyle</p>
              <p>Tech & Gadgets</p>
              <p>Fitness</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
              Followers
            </p>
            <input type="range" className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary-soft accent-primary" />
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
              Engagement Rate
            </p>
            <div className="rounded-lg border border-primary-soft bg-muted px-3 py-2 text-xs font-semibold text-foreground">
              Above 3%
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>KOL Search Results</CardTitle>
            <CardDescription>
              Chọn tối thiểu 2 creators để đi vào bước so sánh chi tiết.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {candidates.map((candidate) => {
              const isSelected = selectedCandidateIds.includes(candidate.id);

              return (
                <article
                  key={candidate.id}
                  className={`rounded-2xl border p-3 transition-colors ${
                    isSelected
                      ? "border-primary bg-primary-soft"
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
                        </div>
                        <p className="mt-0.5 text-xs text-foreground-muted">
                          {toDisplayPlatform(candidate.platform)} • {candidate.niche}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="success">{candidate.fitScore}% Match</Badge>
                          <span className="text-xs text-foreground-muted">
                            Followers <strong className="text-foreground">{formatFollowers(candidate.followers)}</strong>
                          </span>
                          <span className="text-xs text-foreground-muted">
                            Engagement <strong className="text-foreground">{candidate.engagementRate.toFixed(1)}%</strong>
                          </span>
                          <span className="text-xs text-foreground-muted">
                            Rating <strong className="text-foreground">{candidate.avgRoi.toFixed(1)}</strong>
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Strong audience niche fit
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Budget aligned
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleCandidate(candidate.id)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          isSelected
                            ? "bg-primary text-background-dark"
                            : "border border-primary-soft bg-card text-foreground hover:bg-primary-soft"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-background-dark"
                      >
                        Invite
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-primary-soft bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-primary-soft"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary-soft pt-3">
              <p className="text-xs text-foreground-muted">Selected: {selectedCandidateIds.length} / 3</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onRestart}
                  className="rounded-lg border border-primary-soft px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary-soft"
                >
                  New search
                </button>
                <button
                  type="button"
                  onClick={onCompare}
                  disabled={selectedCandidateIds.length < 2}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-background-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Compare selected
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button type="button" className="h-7 w-7 rounded-full border border-primary-soft text-xs text-foreground-muted">
                {"<"}
              </button>
              <button type="button" className="h-7 w-7 rounded-full bg-primary text-xs font-semibold text-background-dark">
                1
              </button>
              <span className="text-xs text-foreground-muted">2</span>
              <span className="text-xs text-foreground-muted">3</span>
              <span className="text-xs text-foreground-muted">...</span>
              <span className="text-xs text-foreground-muted">12</span>
              <button type="button" className="h-7 w-7 rounded-full border border-primary-soft text-xs text-foreground-muted">
                {">"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
