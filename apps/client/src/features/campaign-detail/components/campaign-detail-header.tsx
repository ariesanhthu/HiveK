import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CampaignDetailStatus } from "@/features/campaign-detail/types";

const STATUS_UI: Record<
  CampaignDetailStatus,
  { label: string; variant: "success" | "secondary" | "warning" }
> = {
  active: { label: "ACTIVE", variant: "success" },
  draft: { label: "DRAFT", variant: "secondary" },
  closed: { label: "CLOSED", variant: "warning" },
};

export type CampaignDetailHeaderProps = {
  title: string;
  status: CampaignDetailStatus;
  externalIdLabel: string;
  createdByLabel: string;
};

export function CampaignDetailHeader({
  title,
  status,
  externalIdLabel,
  createdByLabel,
}: CampaignDetailHeaderProps) {
  const ui = STATUS_UI[status];

  return (
    <header className="flex flex-col gap-4 border-b border-primary-soft pb-6 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          <Badge variant={ui.variant} className="shrink-0 uppercase">
            {ui.label}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          {externalIdLabel}
          <span className="mx-2 text-primary-soft">•</span>
          {createdByLabel}
        </p>
      </div>
      <Link
        href="/kol-matching"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-background-dark shadow-primary transition-colors hover:bg-primary/90"
      >
        <span className="material-symbols-outlined text-xl" aria-hidden>
          person_add
        </span>
        Invite More KOLs
      </Link>
    </header>
  );
}
