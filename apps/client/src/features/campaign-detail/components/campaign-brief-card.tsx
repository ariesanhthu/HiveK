import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CampaignDetail } from "@/features/campaign-detail/types";

const PLATFORM_ICON: Record<
  CampaignDetail["brief"]["platforms"][number],
  string
> = {
  instagram: "photo_camera",
  youtube: "smart_display",
  tiktok: "music_note",
};

export type CampaignBriefCardProps = {
  brief: CampaignDetail["brief"];
};

export function CampaignBriefCard({ brief }: CampaignBriefCardProps) {
  return (
    <Card className="rounded-2xl border-primary-soft shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Campaign Brief</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {brief.niches.map((n) => (
            <Badge key={n} variant="secondary" className="font-medium">
              {n}
            </Badge>
          ))}
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            Platforms
          </p>
          <div className="flex gap-2">
            {brief.platforms.map((p) => (
              <span
                key={p}
                className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary-soft bg-primary-soft text-primary"
                )}
                title={p}
              >
                <span className="material-symbols-outlined text-2xl">
                  {PLATFORM_ICON[p]}
                </span>
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">
            Audience Target
          </p>
          <p className="text-sm leading-relaxed text-foreground">{brief.audience}</p>
        </div>
        <button
          type="button"
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-primary-soft bg-card py-2.5 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary-soft"
        >
          {brief.pdfBriefLabel}
          <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">
            arrow_forward
          </span>
        </button>
      </CardContent>
    </Card>
  );
}
