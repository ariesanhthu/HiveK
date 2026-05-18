"use client";

import React, { useState } from "react";
import type { CertificateComment } from "@/features/certificate-product/types";
import { CommentItem } from "./comment-item";

type CommentSectionProps = {
  comments: CertificateComment[];
};

const INITIAL_VISIBLE = 3;

export const CommentSection: React.FC<CommentSectionProps> = ({ comments }) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const hasMore = visibleCount < comments.length;

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          Cộng đồng đánh giá
        </h2>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          <span className="material-symbols-outlined text-base">
            rate_review
          </span>
          Thêm bình luận
        </button>
      </div>

      {/* Comment list */}
      <div className="mt-4 space-y-3">
        {comments.slice(0, visibleCount).map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((prev) => prev + 3)}
          className="mt-4 w-full rounded-xl border border-primary-soft py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Xem thêm bình luận
        </button>
      )}
    </section>
  );
};
