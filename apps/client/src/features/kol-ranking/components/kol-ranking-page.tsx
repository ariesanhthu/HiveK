"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { RankingFilters } from "@/features/kol-ranking/components/ranking-filters";
import { RankingPagination } from "@/features/kol-ranking/components/ranking-pagination";
import { KolRankingTable } from "@/features/kol-ranking/components/kol-ranking-table";
import { useKolRankingRealtime } from "@/features/kol-ranking/hooks/use-kol-ranking-realtime";
import {
  type KolRankingFilters,
  type KolRankingResponse,
} from "@/features/kol-ranking/types";

type KolRankingPageProps = {
  initialData: KolRankingResponse;
  initialFilters: KolRankingFilters;
};

function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function KolRankingPage({
  initialData,
  initialFilters,
}: KolRankingPageProps) {
  const { data, filters, setFilters, setPage, status } = useKolRankingRealtime({
    initialData,
    initialFilters,
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 pb-14 pt-8 md:px-10">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
            KOL Ranking
          </h1>
          <Badge variant={status === "live" ? "success" : "secondary"}>
            {status === "live" ? "Live" : status === "error" ? "Reconnecting" : "Syncing"}
          </Badge>
        </div>
        <p className="text-sm text-foreground-muted md:text-base">
          Bảng xếp hạng real-time cho creators. Data update tự động mỗi vài giây
          và có thể mở rộng sang Kafka/Redis stream khi backend production.
        </p>
        <p className="text-xs text-foreground-muted">
          Last update: {formatTimestamp(data.generatedAt)} • Total: {data.totalItems}
        </p>
      </header>

      <RankingFilters filters={filters} onChange={setFilters} />

      <KolRankingTable items={data.items} />

      <RankingPagination
        page={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
