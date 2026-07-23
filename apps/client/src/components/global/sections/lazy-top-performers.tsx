'use client';

import { useInView } from '@/hooks/use-in-view';
import React, { useEffect, useState } from 'react';

type Props = {
  fallback: React.ReactNode;
  minHeight?: string;
};

export function LazyTopPerformers({
  fallback,
  minHeight = '420px',
}: Props) {
  const [ref, isInView] = useInView();
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (!isInView) return;
    let cancelled = false;
    import('./top-performers-section').then((m) => {
      if (!cancelled) setComponent(() => m.TopPerformersSection);
    });
    return () => {
      cancelled = true;
    };
  }, [isInView]);

  if (Component) return <Component />;
  return (
    <div id='#influencers' ref={ref} style={{ minHeight }} aria-busy={!Component}>
      {fallback}
    </div>
  );
}
