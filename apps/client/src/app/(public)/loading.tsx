import React from "react";
import { SectionSkeleton } from "@/components/global/sections/section-skeleton";

/**
 * Route-level loading UI for (public) group.
 * Shown during navigation / initial page load until page component is ready.
 */
export default function PublicLoading() {
  return (
    <div className="animate-in fade-in duration-200">
      <SectionSkeleton variant="page" />
    </div>
  );
}
