import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CampaignListItem, CampaignStatus } from "@/features/campaigns/types";

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "Hoạt động",
  draft: "Sắp mở",
  closed: "Đã đóng",
};

const STATUS_VARIANT: Record<
  CampaignStatus,
  "success" | "secondary" | "warning"
> = {
  active: "success",
  draft: "secondary",
  closed: "warning",
};

export type CampaignCardProps = CampaignListItem & {
  href?: string;
  className?: string;
};

export function CampaignCard({
  id,
  image,
  category,
  title,
  priceRange,
  status,
  href,
  className,
}: CampaignCardProps) {
  const statusLabel = STATUS_LABEL[status];
  const statusVariant = STATUS_VARIANT[status];

  const body = (
    <>
      <div className="relative aspect-16/10 overflow-hidden rounded-xl">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-primary/20 bg-background px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-colors group-hover:bg-primary/5">
            {category}
          </Badge>
          <Badge variant={statusVariant} className="px-2.5 py-0.5 text-[11px] font-semibold shadow-none">
            {statusLabel}
          </Badge>
        </div>
        <h3 className="line-clamp-2 text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary mb-auto">
          {title}
        </h3>
        <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-border/50">
          <div>
            <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-1">Ngân sách</p>
            <p className="text-base font-black text-primary">{priceRange}</p>
          </div>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-background-dark group-hover:shadow-md group-hover:shadow-primary/25"
            aria-hidden
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-90">arrow_forward</span>
          </span>
        </div>
      </div>
    </>
  );

  const articleClass = cn(
    "group flex h-full flex-col relative block overflow-hidden rounded-2xl border border-border bg-card p-2 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
    className
  );

  if (href) {
    return (
      <Link href={href} id={id} className={articleClass} scroll>
        {body}
      </Link>
    );
  }

  return (
    <article className={articleClass} id={id}>
      {body}
    </article>
  );
}
