"use client";

import { CalendarClock, Clock3, Send, TimerReset } from "lucide-react";
import { type CampaignPost } from "@/features/campaign-planning/types/campaign-planning";

type PostSchedulePanelProps = {
  post: CampaignPost;
  onPostChange: (patch: Partial<CampaignPost>) => void;
};

function toInputDateTime(value: string) {
  return value.slice(0, 16);
}

function getScheduleCaption(post: CampaignPost) {
  if (post.status === "scheduled") return "Bài viết đã được đưa vào hàng đợi đăng tự động.";
  if (post.status === "approved") return "Bài viết đã duyệt và sẵn sàng lên lịch.";
  return "Bài viết cần hoàn tất review trước khi lên lịch chính thức.";
}

export function PostSchedulePanel({ post, onPostChange }: PostSchedulePanelProps) {
  return (
    <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1fr_20rem]">
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground">Thiết lập lịch đăng</h3>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            Điều chỉnh thời điểm đăng và kiểm tra thông tin phân phối của từng bài.
          </p>
        </div>

        <div className="grid gap-4 rounded-lg border border-primary-soft bg-card p-4 shadow-sm sm:grid-cols-2">
          <label className="space-y-2">
            <span className="flex items-center gap-2 text-xs font-bold text-foreground">
              <CalendarClock className="size-4" aria-hidden />
              Ngày giờ đăng
            </span>
            <input
              type="datetime-local"
              value={toInputDateTime(post.scheduledAt)}
              onChange={(event) =>
                onPostChange({
                  scheduledAt: event.target.value,
                  time: event.target.value.slice(11, 16),
                })
              }
              className="h-11 w-full rounded-lg border border-primary-soft bg-background-light px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>

          <label className="space-y-2">
            <span className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Clock3 className="size-4" aria-hidden />
              Khung giờ tối ưu
            </span>
            <select
              value={post.time}
              onChange={(event) => onPostChange({ time: event.target.value })}
              className="h-11 w-full rounded-lg border border-primary-soft bg-background-light px-3 text-sm font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="09:00">09:00 · Nhận diện</option>
              <option value="09:30">09:30 · Phụ huynh</option>
              <option value="11:30">11:30 · Thảo luận</option>
              <option value="19:30">19:30 · Video ngắn</option>
              <option value="20:00">20:00 · Nội dung chuyên sâu</option>
              <option value="20:30">20:30 · Hỏi đáp</option>
            </select>
          </label>
        </div>

        <div className="rounded-lg border border-primary-soft bg-background-light p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
            Preview hàng đợi
          </p>
          <div className="mt-3 flex items-start gap-3 rounded-lg bg-card p-3 shadow-sm">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Send className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">{post.title}</p>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                {post.platform} · {post.dateLabel} · {post.time}
              </p>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-foreground-muted">
                {post.content}
              </p>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-3 rounded-lg border border-primary-soft bg-card p-4 shadow-sm">
        <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <TimerReset className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-extrabold text-foreground">Trạng thái lịch đăng</p>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            {getScheduleCaption(post)}
          </p>
        </div>
        <div className="rounded-lg bg-background-light p-3">
          <p className="text-xs font-bold text-foreground">Hashtag</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {post.hashtags.map((hashtag) => (
              <span
                key={hashtag}
                className="rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-primary"
              >
                {hashtag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
