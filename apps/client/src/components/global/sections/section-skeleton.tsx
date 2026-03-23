import React from "react";
import { cn } from "@/lib/utils";

type SectionSkeletonVariant = "section" | "cards" | "table" | "page";

const variantStyles: Record<
  SectionSkeletonVariant,
  { className: string; lines?: number }
> = {
  section: { className: "py-24", lines: 4 },
  cards: { className: "py-24", lines: 0 },
  table: { className: "py-24", lines: 0 },
  page: { className: "min-h-[60vh] py-12", lines: 8 },
};

type SectionSkeletonProps = {
  variant?: SectionSkeletonVariant;
  className?: string;
};

/**
 * Skeleton placeholder for sections while dynamic content loads.
 * Uses pulse animation and semantic structure for a11y.
 */
export function SectionSkeleton({
  variant = "section",
  className,
}: SectionSkeletonProps) {
  const { className: variantClassName, lines } = variantStyles[variant];
  const lineCount = lines ?? 0;

  return (
    <section
      className={cn("mx-auto max-w-7xl px-6", variantClassName, className)}
      aria-hidden="true"
    >
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="h-4 w-24 rounded-full bg-primary/10 animate-pulse" />
        <div className="h-8 w-64 rounded-lg bg-primary/10 animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded bg-primary/5 animate-pulse" />
      </div>

      {variant === "cards" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-primary-soft bg-background-light p-4 dark:bg-background-dark"
            >
              <div className="aspect-16/10 rounded-xl bg-primary/10 animate-pulse" />
              <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-primary/10 animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-primary/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "table" && (
        <div className="overflow-hidden rounded-2xl border border-primary-soft">
          <div className="h-12 w-full bg-primary/5 animate-pulse" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex h-14 items-center gap-4 border-t border-primary-soft px-6"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 animate-pulse" />
              <div className="h-4 flex-1 rounded bg-primary/5 animate-pulse" />
              <div className="h-4 w-20 rounded bg-primary/5 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {lineCount > 0 && (
        <div className="space-y-3">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded bg-primary/5 animate-pulse",
                i === 0 ? "h-6 w-full" : "h-4 w-full"
              )}
              style={{
                width: i > 0 ? `${100 - (i % 3) * 15}%` : undefined,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
