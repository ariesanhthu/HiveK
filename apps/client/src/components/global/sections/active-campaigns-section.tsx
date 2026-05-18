"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { CampaignCard } from "@/features/campaigns/components/campaign-card";
import { ACTIVE_CAMPAIGNS } from "@/data/mock-data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const ActiveCampaignsSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section
      id="campaigns"
      className="bg-background-light py-24 dark:bg-background-dark/30"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div className="max-w-xl">
            <h2 className="text-3xl font-black text-foreground">
              Chiến dịch Nổi bật
            </h2>
            <p className="mt-4 text-muted">
              Các thương vụ giá trị cao đang mở hợp tác
            </p>
          </div>
          <Link
            href="/campaigns"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary-soft bg-card px-5 py-2.5 text-sm font-bold text-primary transition-colors hover:border-primary hover:bg-primary-soft"
          >
            Xem tất cả
            <span className="material-symbols-outlined text-lg" aria-hidden>
              arrow_forward
            </span>
          </Link>
        </div>
        
        <div className="group relative">
          {/* Mờ hai bên */}
          <div 
            className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-16 opacity-0 transition-opacity duration-300 sm:w-32" 
            style={{ 
              background: "linear-gradient(to right, var(--color-background-light) 0%, transparent 100%)",
              opacity: canScrollLeft ? 1 : 0 
            }}
          />
          <div 
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-16 opacity-0 transition-opacity duration-300 sm:w-32" 
            style={{ 
              background: "linear-gradient(to left, var(--color-background-light) 0%, transparent 100%)",
              opacity: canScrollRight ? 1 : 0 
            }}
          />

          {/* Nút cuộn trái */}
          <button
            type="button"
            onClick={() => scrollBy(-400)}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-2 top-1/2 z-20 -translate-y-1/2 flex size-12 items-center justify-center rounded-full border border-primary/20 bg-background text-primary shadow-xl transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white sm:left-4",
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            aria-label="Cuộn sang trái"
          >
            <ChevronLeft className="size-6" />
          </button>

          {/* Nút cuộn phải */}
          <button
            type="button"
            onClick={() => scrollBy(400)}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-2 top-1/2 z-20 -translate-y-1/2 flex size-12 items-center justify-center rounded-full border border-primary/20 bg-background text-primary shadow-xl transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white sm:right-4",
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            aria-label="Cuộn sang phải"
          >
            <ChevronRight className="size-6" />
          </button>

          {/* Wrapper */}
          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {ACTIVE_CAMPAIGNS.map((campaign) => (
              <div 
                key={campaign.id} 
                className="w-[85vw] shrink-0 snap-start sm:w-[400px]"
              >
                <CampaignCard
                  {...campaign}
                  href={`/campaigns/${campaign.id}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
