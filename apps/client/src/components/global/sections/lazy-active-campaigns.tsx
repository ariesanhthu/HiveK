"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "@/hooks/use-in-view";

type Props = {
  fallback: React.ReactNode;
  minHeight?: string;
};

export function LazyActiveCampaigns({
  fallback,
  minHeight = "480px",
}: Props) {
  const [ref, isInView] = useInView();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (!isInView) return;
    let cancelled = false;
    import("./active-campaigns-section").then((m) => {
      if (!cancelled) setComponent(() => m.ActiveCampaignsSection);
    });
    return () => {
      cancelled = true;
    };
  }, [isInView]);

  if (Component) return <Component />;
  return (
    <div ref={ref} style={{ minHeight }} aria-busy={!Component}>
      {fallback}
    </div>
  );
}
