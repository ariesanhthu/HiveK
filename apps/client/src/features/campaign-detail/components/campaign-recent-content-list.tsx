"use client";

import React, { useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CampaignContentItem } from "@/features/campaign-detail/types";

export type CampaignRecentContentListProps = {
  items: CampaignContentItem[];
  totalContentCount: number;
};

export function CampaignRecentContentList({
  items,
  totalContentCount,
}: CampaignRecentContentListProps) {
  const [local, setLocal] = useState(items);

  const approve = useCallback((id: string) => {
    setLocal((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, state: "approved" as const } : item
      )
    );
  }, []);

  const decline = useCallback((id: string) => {
    setLocal((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <Card className="rounded-2xl border-primary-soft shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {local.map((item) => (
          <article
            key={item.id}
            className="flex gap-3 rounded-xl border border-primary-soft/80 bg-muted/10 p-3 transition-colors hover:bg-muted/20"
          >
            <img
              src={item.thumbnailUrl}
              alt=""
              width={72}
              height={72}
              className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted">
                  {item.authorName} · {item.timeLabel}
                </p>
              </div>
              {item.state === "pending_review" ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    PENDING REVIEW
                  </Badge>
                  <button
                    type="button"
                    onClick={() => approve(item.id)}
                    className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-background-dark transition-colors hover:bg-primary/90"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => decline(item.id)}
                    className="rounded-lg border border-primary-soft px-3 py-1 text-xs font-bold text-foreground transition-colors hover:bg-muted"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <Badge variant="success" className="text-[10px] uppercase">
                  APPROVED
                </Badge>
              )}
            </div>
          </article>
        ))}
        <button
          type="button"
          className="w-full rounded-xl border border-dashed border-primary-soft py-2.5 text-xs font-bold uppercase tracking-wide text-primary transition-colors hover:bg-primary-soft"
        >
          View all content ({totalContentCount})
        </button>
      </CardContent>
    </Card>
  );
}
