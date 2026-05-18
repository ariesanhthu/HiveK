import React from "react";

/**
 * Full-page loading skeleton for the certificate product page.
 * Matches the 2-column layout with video, product card, KOL info, and comments.
 */
export const CertificatePageSkeleton: React.FC = () => {
  const pulse = "animate-pulse rounded-xl bg-primary-soft";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Video skeleton */}
          <div className={`${pulse} aspect-video w-full rounded-2xl`} />

          {/* KOL info skeleton */}
          <div className="flex items-center gap-4 rounded-2xl border border-primary-soft bg-card p-5">
            <div className={`${pulse} h-14 w-14 shrink-0 rounded-full`} />
            <div className="flex-1 space-y-2">
              <div className={`${pulse} h-4 w-36`} />
              <div className={`${pulse} h-3 w-24`} />
            </div>
          </div>

          {/* Quote skeleton */}
          <div className="space-y-2 rounded-2xl border border-primary-soft bg-card p-5">
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-4/5`} />
            <div className={`${pulse} h-3 w-3/5`} />
          </div>
        </div>

        {/* Right column — product card skeleton */}
        <div className="rounded-2xl border border-primary-soft bg-card overflow-hidden">
          <div className={`${pulse} aspect-[4/3] w-full rounded-none`} />
          <div className="space-y-3 p-5">
            <div className={`${pulse} h-4 w-28`} />
            <div className={`${pulse} h-5 w-44`} />
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-6 w-24`} />
            <div className={`${pulse} h-11 w-full`} />
          </div>
        </div>
      </div>

      {/* Comments skeleton */}
      <div className="mt-8 space-y-3">
        <div className={`${pulse} h-5 w-48`} />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-3.5 rounded-xl border border-primary-soft bg-card p-4"
          >
            <div className={`${pulse} h-10 w-10 shrink-0 rounded-full`} />
            <div className="flex-1 space-y-2">
              <div className={`${pulse} h-3 w-32`} />
              <div className={`${pulse} h-3 w-full`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
