"use client";

import { useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number;
};

/**
 * Returns [ref, isInView]. Attach ref to a DOM node; isInView becomes true when it enters viewport.
 * Used for lazy-loading sections without pulling all section modules into one bundle.
 */
export function useInView(options: UseInViewOptions = {}) {
  const { rootMargin = "120px", threshold = 0.05 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) setIsInView(true);
      },
      { rootMargin, threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, isInView] as const;
}
