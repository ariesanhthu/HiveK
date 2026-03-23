import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type KolCandidate } from "@/features/kol-matching/types";

type KolComparisonTableProps = {
  candidates: KolCandidate[];
  onBack: () => void;
  onRestart: () => void;
};

function formatFollowers(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

function getHandle(name: string): string {
  return `@${name.toLowerCase().replace(/\s+/g, "_")}`;
}

function renderStars(score: number) {
  const fullStars = Math.round(score);
  return (
    <div className="flex items-center gap-0.5 text-primary">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={`star-${score}-${index}`} className="material-symbols-outlined text-sm">
          {index < fullStars ? "star" : "star_outline"}
        </span>
      ))}
    </div>
  );
}

function getCompletionRate(candidate: KolCandidate): number {
  return Math.min(100, Math.round(candidate.fitScore + 5));
}

function getAudienceFitBadge(score: number): { text: string; variant: "success" | "warning" } {
  if (score >= 88) return { text: "High Match", variant: "success" };
  return { text: "Medium Fit", variant: "warning" };
}

function getRiskLevel(estimatedCpaUsd: number): { text: string; variant: "default" | "warning" } {
  if (estimatedCpaUsd <= 5.2) return { text: "Low", variant: "default" };
  return { text: "Medium", variant: "warning" };
}

export function KolComparisonTable({
  candidates,
  onBack,
  onRestart,
}: KolComparisonTableProps) {
  const highestFitScore = Math.max(...candidates.map((candidate) => candidate.fitScore));
  const lowestFee = Math.min(...candidates.map((candidate) => candidate.estimatedCostPerPostUsd));

  return (
    <section className="w-full space-y-4">
      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse">
              <thead>
                <tr>
                  <th className="w-52 rounded-tl-3xl bg-primary-soft px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-foreground-muted">
                    Campaign Metrics
                  </th>
                  {candidates.map((candidate, index) => (
                    <th
                      key={candidate.id}
                      className={`border-l border-primary-soft bg-primary-soft px-4 py-3 text-left align-top ${
                        index === candidates.length - 1 ? "rounded-tr-3xl" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary">
                          {candidate.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-foreground">{candidate.name}</p>
                          <p className="text-xs text-primary">{getHandle(candidate.name)}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-4 text-sm font-semibold text-foreground">Match Score</td>
                  {candidates.map((candidate) => (
                    <td
                      key={`${candidate.id}-score`}
                      className={`border-l border-primary-soft px-4 py-4 ${
                        candidate.fitScore === highestFitScore ? "bg-primary-soft/70" : ""
                      }`}
                    >
                      <p className="text-4xl font-bold text-primary">{candidate.fitScore}%</p>
                      {candidate.fitScore === highestFitScore ? (
                        <p className="text-[10px] font-bold uppercase text-primary">Highest Match</p>
                      ) : null}
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-3 text-sm text-foreground-muted">Followers</td>
                  {candidates.map((candidate) => (
                    <td key={`${candidate.id}-followers`} className="border-l border-primary-soft px-4 py-3 text-lg font-semibold text-foreground">
                      {formatFollowers(candidate.followers)}
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-3 text-sm text-foreground-muted">Engagement</td>
                  {candidates.map((candidate) => (
                    <td key={`${candidate.id}-engagement`} className="border-l border-primary-soft px-4 py-3 text-lg font-semibold text-primary">
                      {candidate.engagementRate.toFixed(1)}%
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-3 text-sm text-foreground-muted">Rating</td>
                  {candidates.map((candidate) => (
                    <td key={`${candidate.id}-rating`} className="border-l border-primary-soft px-4 py-3">
                      {renderStars(candidate.avgRoi)}
                      <p className="text-xs text-foreground-muted">{candidate.avgRoi.toFixed(1)}</p>
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-3 text-sm text-foreground-muted">Completion Rate</td>
                  {candidates.map((candidate) => (
                    <td key={`${candidate.id}-completion`} className="border-l border-primary-soft px-4 py-3 text-lg font-semibold text-primary">
                      {getCompletionRate(candidate)}%
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-3 text-sm text-foreground-muted">Estimated Fee</td>
                  {candidates.map((candidate) => (
                    <td
                      key={`${candidate.id}-fee`}
                      className={`border-l border-primary-soft px-4 py-3 text-xl font-bold text-foreground ${
                        candidate.estimatedCostPerPostUsd === lowestFee ? "bg-primary-soft/70 text-primary" : ""
                      }`}
                    >
                      ${candidate.estimatedCostPerPostUsd.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-3 text-sm text-foreground-muted">Audience Fit</td>
                  {candidates.map((candidate) => {
                    const audienceFit = getAudienceFitBadge(candidate.fitScore);
                    return (
                      <td key={`${candidate.id}-audience-fit`} className="border-l border-primary-soft px-4 py-3">
                        <Badge variant={audienceFit.variant}>{audienceFit.text}</Badge>
                      </td>
                    );
                  })}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className="px-4 py-3 text-sm text-foreground-muted">Risk Level</td>
                  {candidates.map((candidate) => {
                    const riskLevel = getRiskLevel(candidate.estimatedCpaUsd);
                    return (
                      <td key={`${candidate.id}-risk`} className="border-l border-primary-soft px-4 py-3">
                        <Badge variant={riskLevel.variant}>{riskLevel.text}</Badge>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl">
        <CardContent className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-4 py-4 md:min-h-0 md:px-5 md:py-4 md:pt-4">
          <div className="flex items-center gap-3 self-center">
            <div className="flex -space-x-2">
              {candidates.map((candidate) => (
                <div
                  key={`avatar-${candidate.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-bold text-primary"
                >
                  {candidate.name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {candidates.length} KOLs selected for review
              </p>
              <p className="text-xs text-foreground-muted">
                Shortlisting these creators will add them to your campaign workspace.
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2 self-center">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-primary-soft bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary-soft"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full bg-muted px-5 py-2 text-sm font-bold text-foreground hover:bg-primary-soft"
            >
              Save Shortlist
            </button>
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-background-dark"
            >
              Invite Selected
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
