"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { type KolCandidate } from "@/features/kol-matching/types";
import { cn } from "@/lib/utils";

type KolComparisonTableProps = {
  candidates: KolCandidate[];
  onBack: () => void;
  onRestart: () => void;
};

const METRIC_LABEL_CELL_CLASS = "px-4 py-3 text-sm text-foreground-muted";
const METRIC_VALUE_CELL_CLASS = "border-l border-primary-soft px-4 py-3 align-middle text-center";
const METRIC_VALUE_TEXT_CLASS = "text-[2rem] leading-none font-bold text-primary";
const METRIC_NUMBER_TEXT_CLASS = "text-[2rem] leading-none font-bold text-foreground";
const METRIC_BADGE_CLASS = "text-xs font-semibold leading-4";

const EXCLUDED_COLUMN_CLASS =
  "bg-muted/40 opacity-[0.38] grayscale transition-[opacity,filter,background-color] duration-200 ease-out";

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
    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary-soft bg-primary-soft px-2.5 py-1">
      <div className="flex items-center gap-0.5 text-primary">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={`star-${score}-${index}`} className="material-symbols-outlined text-sm leading-none">
            {index < fullStars ? "star" : "star_outline"}
          </span>
        ))}
      </div>
      <span className="min-w-8 text-right text-xs font-semibold leading-none text-foreground">
        {score.toFixed(1)}
      </span>
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

function formatMoney(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function KolComparisonTable({
  candidates,
  onBack,
  onRestart,
}: KolComparisonTableProps) {
  const [excludedCandidateIds, setExcludedCandidateIds] = useState<string[]>([]);

  const activeCandidates = useMemo(
    () => candidates.filter((c) => !excludedCandidateIds.includes(c.id)),
    [candidates, excludedCandidateIds]
  );

  const highestFitScore =
    activeCandidates.length > 0 ? Math.max(...activeCandidates.map((c) => c.fitScore)) : 0;
  const lowestFee =
    activeCandidates.length > 0
      ? Math.min(...activeCandidates.map((c) => c.estimatedCostPerPostUsd))
      : 0;
  const highestFitCount = activeCandidates.filter((c) => c.fitScore === highestFitScore).length;

  const excludedCount = excludedCandidateIds.length;
  const activeCount = candidates.length - excludedCount;

  function toggleColumnExcluded(candidateId: string): void {
    setExcludedCandidateIds((previous) =>
      previous.includes(candidateId) ? previous.filter((id) => id !== candidateId) : [...previous, candidateId]
    );
  }

  function isColumnExcluded(candidateId: string): boolean {
    return excludedCandidateIds.includes(candidateId);
  }

  return (
    <section className="w-full space-y-4">
      <Card className="overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse lg:min-w-0">
              <thead>
                <tr>
                  <th className="w-52 px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-foreground-muted">
                    Chỉ số Chiến dịch
                  </th>
                  {candidates.map((candidate, index) => {
                    const excluded = isColumnExcluded(candidate.id);
                    return (
                      <th
                        key={candidate.id}
                        className={cn(
                          "border-l border-primary-soft px-4 py-4 text-left align-top",
                          index === candidates.length - 1 ? "pr-5" : "",
                          excluded && EXCLUDED_COLUMN_CLASS
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <div
                              className={cn(
                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-primary",
                                excluded && "bg-muted/80 text-foreground-muted"
                              )}
                            >
                              {candidate.name
                                .split(" ")
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "truncate text-base font-bold text-foreground",
                                  excluded && "text-foreground-muted"
                                )}
                              >
                                {candidate.name}
                              </p>
                              <p
                                className={cn("text-xs text-primary", excluded && "text-foreground-muted")}
                              >
                                {getHandle(candidate.name)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleColumnExcluded(candidate.id)}
                            className={cn(
                              "shrink-0 rounded-full p-1.5 transition-colors",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              excluded
                                ? "text-primary hover:bg-primary-soft"
                                : "text-foreground-muted hover:bg-muted hover:text-foreground"
                            )}
                            aria-label={
                              excluded ? "Restore this creator in the comparison" : "Hide this column (dimmed)"
                            }
                            aria-pressed={excluded}
                          >
                            <span className="material-symbols-outlined text-[1.125rem] leading-none" aria-hidden>
                              {excluded ? "undo" : "close"}
                            </span>
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="[&_tr>td]:transition-colors [&_tr:hover>td:not([data-excluded])]:bg-primary-soft">
                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={`${METRIC_LABEL_CELL_CLASS} font-semibold text-foreground`}>Điểm phù hợp</td>
                  {candidates.map((candidate) => {
                    const excluded = isColumnExcluded(candidate.id);
                    const isTop =
                      !excluded &&
                      activeCandidates.length > 0 &&
                      candidate.fitScore === highestFitScore;
                    return (
                      <td
                        key={`${candidate.id}-score`}
                        data-excluded={excluded ? "" : undefined}
                        className={cn(
                          METRIC_VALUE_CELL_CLASS,
                          "py-4",
                          isTop ? "bg-primary-soft/70" : "",
                          excluded && EXCLUDED_COLUMN_CLASS
                        )}
                      >
                        <p className={METRIC_VALUE_TEXT_CLASS}>{candidate.fitScore}%</p>
                        {isTop ? (
                          <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                            {highestFitCount > 1 ? "Điểm Cao nhất" : "Độ Phù hợp Cao nhất"}
                          </p>
                        ) : (
                          <p className="invisible text-[10px] font-bold uppercase tracking-wide">
                            Độ Phù hợp Cao nhất
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={METRIC_LABEL_CELL_CLASS}>Người theo dõi</td>
                  {candidates.map((candidate) => (
                    <td
                      key={`${candidate.id}-followers`}
                      data-excluded={isColumnExcluded(candidate.id) ? "" : undefined}
                      className={cn(
                        METRIC_VALUE_CELL_CLASS,
                        isColumnExcluded(candidate.id) && EXCLUDED_COLUMN_CLASS
                      )}
                    >
                      <p className={METRIC_NUMBER_TEXT_CLASS}>{formatFollowers(candidate.followers)}</p>
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={METRIC_LABEL_CELL_CLASS}>Mức tương tác</td>
                  {candidates.map((candidate) => (
                    <td
                      key={`${candidate.id}-engagement`}
                      data-excluded={isColumnExcluded(candidate.id) ? "" : undefined}
                      className={cn(
                        METRIC_VALUE_CELL_CLASS,
                        isColumnExcluded(candidate.id) && EXCLUDED_COLUMN_CLASS
                      )}
                    >
                      <p className={METRIC_VALUE_TEXT_CLASS}>{candidate.engagementRate.toFixed(1)}%</p>
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={METRIC_LABEL_CELL_CLASS}>Đánh giá</td>
                  {candidates.map((candidate) => (
                    <td
                      key={`${candidate.id}-rating`}
                      data-excluded={isColumnExcluded(candidate.id) ? "" : undefined}
                      className={cn(
                        METRIC_VALUE_CELL_CLASS,
                        isColumnExcluded(candidate.id) && EXCLUDED_COLUMN_CLASS
                      )}
                    >
                      {renderStars(candidate.avgRoi)}
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={METRIC_LABEL_CELL_CLASS}>Tỷ lệ Hoàn thành</td>
                  {candidates.map((candidate) => (
                    <td
                      key={`${candidate.id}-completion`}
                      data-excluded={isColumnExcluded(candidate.id) ? "" : undefined}
                      className={cn(
                        METRIC_VALUE_CELL_CLASS,
                        isColumnExcluded(candidate.id) && EXCLUDED_COLUMN_CLASS
                      )}
                    >
                      <p className={METRIC_VALUE_TEXT_CLASS}>{getCompletionRate(candidate)}%</p>
                    </td>
                  ))}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={METRIC_LABEL_CELL_CLASS}>Chi phí Ước tính</td>
                  {candidates.map((candidate) => {
                    const excluded = isColumnExcluded(candidate.id);
                    const isLowest =
                      !excluded &&
                      activeCandidates.length > 0 &&
                      candidate.estimatedCostPerPostUsd === lowestFee;
                    return (
                      <td
                        key={`${candidate.id}-fee`}
                        data-excluded={excluded ? "" : undefined}
                        className={cn(
                          METRIC_VALUE_CELL_CLASS,
                          isLowest ? "bg-primary-soft/70 text-primary" : "",
                          excluded && EXCLUDED_COLUMN_CLASS
                        )}
                      >
                        <p className={METRIC_NUMBER_TEXT_CLASS}>{formatMoney(candidate.estimatedCostPerPostUsd)}</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={METRIC_LABEL_CELL_CLASS}>Phù hợp Khán giả</td>
                  {candidates.map((candidate) => {
                    const audienceFit = getAudienceFitBadge(candidate.fitScore);
                    const excluded = isColumnExcluded(candidate.id);
                    return (
                      <td
                        key={`${candidate.id}-audience-fit`}
                        data-excluded={excluded ? "" : undefined}
                        className={cn(METRIC_VALUE_CELL_CLASS, excluded && EXCLUDED_COLUMN_CLASS)}
                      >
                        <Badge variant={audienceFit.variant} className={METRIC_BADGE_CLASS}>
                          {audienceFit.text}
                        </Badge>
                      </td>
                    );
                  })}
                </tr>

                <tr className="odd:bg-card even:bg-muted/60">
                  <td className={METRIC_LABEL_CELL_CLASS}>Mức độ Rủi ro</td>
                  {candidates.map((candidate) => {
                    const riskLevel = getRiskLevel(candidate.estimatedCpaUsd);
                    const excluded = isColumnExcluded(candidate.id);
                    return (
                      <td
                        key={`${candidate.id}-risk`}
                        data-excluded={excluded ? "" : undefined}
                        className={cn(METRIC_VALUE_CELL_CLASS, excluded && EXCLUDED_COLUMN_CLASS)}
                      >
                        <Badge variant={riskLevel.variant} className={METRIC_BADGE_CLASS}>
                          {riskLevel.text}
                        </Badge>
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
              {candidates.map((candidate) => {
                const excluded = isColumnExcluded(candidate.id);
                return (
                  <div
                    key={`avatar-${candidate.id}`}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-bold text-primary transition-opacity duration-200",
                      excluded && "opacity-40 grayscale"
                    )}
                    title={excluded ? `${candidate.name} — hidden in table` : candidate.name}
                  >
                    {candidate.name
                      .split(" ")
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join("")}
                  </div>
                );
              })}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {excludedCount === 0
                  ? `${candidates.length} KOL đã chọn để xem xét`
                  : `${activeCount} / ${candidates.length} KOL đang được so sánh`}
              </p>
              <p className="text-xs text-foreground-muted">
                {excludedCount > 0
                  ? `${excludedCount} bị ẩn. Sử dụng nút hoàn tác trên tiêu đề cột để khôi phục.`
                  : "Đưa các creator này vào danh sách rút gọn sẽ thêm họ vào không gian làm việc chiến dịch của bạn."}
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2 self-center">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-primary-soft bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-primary-soft"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full bg-muted px-5 py-2 text-sm font-bold text-foreground hover:bg-primary-soft"
            >
              Lưu Danh sách rút gọn
            </button>
            <button
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-background-dark"
            >
              Mời người đã chọn
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
