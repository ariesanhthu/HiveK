"use client";

import React from "react";
import { cn } from "@/lib/utils";

type RankingPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

function getPaginationWindow(page: number, totalPages: number): number[] {
  const WINDOW_SIZE = 5;
  const halfWindow = Math.floor(WINDOW_SIZE / 2);
  const start = Math.max(1, page - halfWindow);
  const end = Math.min(totalPages, start + WINDOW_SIZE - 1);
  const shiftedStart = Math.max(1, end - WINDOW_SIZE + 1);

  return Array.from(
    { length: end - shiftedStart + 1 },
    (_, index) => shiftedStart + index
  );
}

export function RankingPagination({
  page,
  totalPages,
  onPageChange,
}: RankingPaginationProps) {
  const pages = getPaginationWindow(page, totalPages);
  const isDisabled = totalPages <= 1;

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary-soft bg-card px-4 py-3">
      <p className="text-sm text-foreground-muted">
        Page <span className="font-semibold text-foreground">{page}</span> /{" "}
        {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={isDisabled || page === 1}
          className="rounded-xl border border-primary-soft px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>

        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={cn(
              "min-w-9 rounded-xl border px-3 py-1.5 text-sm font-semibold transition",
              pageNumber === page
                ? "border-primary bg-primary text-background-dark"
                : "border-primary-soft text-foreground hover:bg-primary-soft"
            )}
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={isDisabled || page === totalPages}
          className="rounded-xl border border-primary-soft px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
