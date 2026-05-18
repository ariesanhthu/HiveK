import React from "react";
import { cn } from "@/lib/utils";

type CampaignKpiDonutProps = {
  label: string;
  valueLabel: string;
  percent: number;
  strokeClass: string;
};

const R = 44;
const STROKE = 8;
const C = 2 * Math.PI * (R - STROKE / 2);

export function CampaignKpiDonut({
  label,
  valueLabel,
  percent,
  strokeClass,
}: CampaignKpiDonutProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const dashOffset = C * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="relative h-32 w-32">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r={R - STROKE / 2}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-muted"
          />
          <circle
            cx="50"
            cy="50"
            r={R - STROKE / 2}
            fill="none"
            strokeWidth={STROKE}
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={cn(strokeClass)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-foreground">{valueLabel}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-muted">{label}</span>
    </div>
  );
}
