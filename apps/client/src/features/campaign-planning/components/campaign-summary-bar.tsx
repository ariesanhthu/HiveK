import { CalendarDays, CheckCircle2 } from "lucide-react";

type CampaignSummaryBarProps = {
  total: number;
  approved: number;
  scheduled: number;
  needsReview: number;
  onApproveAll: () => void;
  onScheduleCampaign: () => void;
};

export function CampaignSummaryBar({
  total,
  approved,
  scheduled,
  needsReview,
  onApproveAll,
  onScheduleCampaign,
}: CampaignSummaryBarProps) {
  return (
    <footer className="shrink-0 border-t border-primary-soft bg-card px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.04)] md:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
            Tổng quan kế hoạch
          </p>
          <p className="mt-0.5 text-sm font-bold text-foreground">
            {total} bài viết ·{" "}
            <span className="text-emerald-600">{approved} đã duyệt</span> ·{" "}
            <span className="text-blue-600">{scheduled} đã lên lịch</span> ·{" "}
            <span className="text-amber-600">{needsReview} cần xem lại</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onApproveAll}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary-soft px-4 text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            <CheckCircle2 className="size-4" aria-hidden />
            Duyệt tất cả
          </button>
          <button
            type="button"
            onClick={onScheduleCampaign}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-secondary px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-500"
          >
            <CalendarDays className="size-4" aria-hidden />
            Xác nhận lịch đăng
          </button>
        </div>
      </div>
    </footer>
  );
}
