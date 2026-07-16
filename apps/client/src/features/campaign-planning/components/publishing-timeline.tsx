import { Clock } from "lucide-react";
import {
  type CampaignPost,
  type PublishingDay,
} from "@/features/campaign-planning/types/campaign-planning";
import { cn } from "@/lib/utils";

type PublishingTimelineProps = {
  days: PublishingDay[];
  selectedPostId: string;
  isCompact: boolean;
  onCompactChange: (isCompact: boolean) => void;
  onPostSelect: (postId: string) => void;
};

const STATUS_LABELS: Record<CampaignPost["status"], string> = {
  draft: "Bản nháp",
  "needs-review": "Cần xem lại",
  approved: "Đã duyệt",
  scheduled: "Đã lên lịch",
};

const STATUS_STYLES: Record<CampaignPost["status"], string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-500",
  "needs-review": "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  scheduled: "border-blue-200 bg-blue-50 text-blue-700",
};

export function PublishingTimeline({
  days,
  selectedPostId,
  isCompact,
  onCompactChange,
  onPostSelect,
}: PublishingTimelineProps) {
  return (
    <section className="min-h-0 flex-1">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-foreground">Lịch nội dung đề xuất</h2>
        <button
          type="button"
          onClick={() => onCompactChange(!isCompact)}
          className="rounded-md px-2 py-1 text-xs font-semibold text-foreground-muted transition-colors hover:bg-muted hover:text-foreground"
        >
          {isCompact ? "Mở rộng" : "Rút gọn"}
        </button>
      </div>

      <div className="relative h-full overflow-y-auto pr-2">
        <div className="absolute bottom-0 left-3 top-1 w-px bg-primary-soft" />

        <div className="relative z-10 space-y-4 pb-4">
          {days.map((day) => (
            <div key={day.day} className="relative pl-8">
              <span className="absolute left-[7px] top-1 size-3 rounded-full border-2 border-primary bg-card" />
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground">Ngày {day.day}</span>
                <span className="text-[11px] text-foreground-muted">{day.dateLabel}</span>
              </div>

              <div className="space-y-2">
                {isCompact ? (
                  <div className="rounded-lg border border-primary-soft bg-card px-3 py-2 text-xs font-medium text-foreground-muted shadow-sm">
                    {day.posts.length} bài viết
                  </div>
                ) : (
                  day.posts.map((post) => {
                    const isActive = post.id === selectedPostId;

                    return (
                      <button
                        key={post.id}
                        type="button"
                        onClick={() => onPostSelect(post.id)}
                        className={cn(
                          "relative w-full overflow-hidden rounded-lg border bg-card p-2 text-left shadow-sm transition-colors hover:border-primary/50",
                          isActive ? "border-primary ring-1 ring-primary" : "border-primary-soft"
                        )}
                      >
                        {isActive ? (
                          <span className="absolute inset-y-0 left-0 w-1 bg-primary" />
                        ) : null}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-foreground-muted">
                            <Clock className="size-3" aria-hidden />
                            {post.time}
                          </span>
                          <span
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                              STATUS_STYLES[post.status]
                            )}
                          >
                            {STATUS_LABELS[post.status]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs font-bold text-foreground">
                          {post.title}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
