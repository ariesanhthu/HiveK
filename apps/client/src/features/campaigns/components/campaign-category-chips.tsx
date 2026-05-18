"use client";

import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { CAMPAIGN_FILTER_ALL } from "@/data/mock-data";

const chipVariants = cva(
  "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
  {
    variants: {
      active: {
        true: "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20",
        false:
          "border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-foreground",
      },
    },
    defaultVariants: { active: false },
  }
);

export type CampaignCategoryChipsProps = {
  categories: readonly string[];
  selected: string;
  onSelect: (category: string) => void;
  className?: string;
};

export function CampaignCategoryChips({
  categories,
  selected,
  onSelect,
  className,
}: CampaignCategoryChipsProps) {
  const options = [CAMPAIGN_FILTER_ALL, ...categories] as const;

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 overflow-x-auto pb-4 pt-1 sm:flex-wrap sm:overflow-visible sm:pb-0",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      role="tablist"
      aria-label="Lọc theo ngành hàng"
    >
      {options.map((key) => {
        const label =
          key === CAMPAIGN_FILTER_ALL ? "Tất cả" : key;
        const isActive = selected === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(chipVariants({ active: isActive }))}
            onClick={() => onSelect(key)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
