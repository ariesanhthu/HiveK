import React from "react";
import type { CertificateComment } from "@/features/certificate-product/types";

type CommentItemProps = {
  comment: CertificateComment;
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek} tuần trước`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${Math.floor(diffMonth / 12)} năm trước`;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <div className="flex gap-3.5 rounded-xl border border-primary-soft bg-card px-4 py-4 transition-colors hover:bg-muted/50">
      {/* Avatar */}
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
        <img
          src={comment.authorAvatarUrl}
          alt={comment.authorName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            {comment.authorName}
          </span>
          <span className="text-xs text-foreground-muted">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground-muted">
          {comment.content}
        </p>
      </div>
    </div>
  );
};
