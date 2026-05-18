"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type KolRankingFilters,
  type KolRankingResponse,
} from "@/features/kol-ranking/types";

const RECONNECT_DELAY_MS = 2_000;

type RealtimeStatus = "connecting" | "live" | "error";

type UseKolRankingRealtimeParams = {
  initialData: KolRankingResponse;
  initialFilters: KolRankingFilters;
};

type UseKolRankingRealtimeReturn = {
  data: KolRankingResponse;
  filters: KolRankingFilters;
  status: RealtimeStatus;
  setFilters: (nextFilters: Partial<KolRankingFilters>) => void;
  setPage: (nextPage: number) => void;
};

function toQueryString(filters: KolRankingFilters): string {
  const params = new URLSearchParams();
  params.set("niche", filters.niche);
  params.set("platform", filters.platform);
  params.set("followerRange", filters.followerRange);
  params.set("search", filters.search);
  params.set("page", String(filters.page));
  params.set("pageSize", String(filters.pageSize));
  return params.toString();
}

export function useKolRankingRealtime({
  initialData,
  initialFilters,
}: UseKolRankingRealtimeParams): UseKolRankingRealtimeReturn {
  const [data, setData] = useState<KolRankingResponse>(initialData);
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const [filters, setFiltersState] = useState<KolRankingFilters>(initialFilters);

  const queryString = useMemo(() => toQueryString(filters), [filters]);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      setStatus("connecting");
      eventSource = new EventSource(`/api/ranking/kols/live?${queryString}`);

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as KolRankingResponse;
          setData(payload);
          setStatus("live");
        } catch {
          setStatus("error");
        }
      };

      eventSource.onerror = () => {
        setStatus("error");
        eventSource?.close();
        reconnectTimeout = setTimeout(connect, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [queryString]);

  const setFilters = (nextFilters: Partial<KolRankingFilters>) => {
    setFiltersState((currentFilters) => ({
      ...currentFilters,
      ...nextFilters,
      page: 1,
    }));
  };

  const setPage = (nextPage: number) => {
    setFiltersState((currentFilters) => ({ ...currentFilters, page: nextPage }));
  };

  return {
    data,
    filters,
    status,
    setFilters,
    setPage,
  };
}
