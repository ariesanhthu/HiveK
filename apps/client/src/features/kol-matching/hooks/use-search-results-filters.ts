"use client";

import { useCallback, useMemo, useState } from "react";
import {
  filterKolCandidatesBySearchFilters,
  getDefaultSearchResultsFilterState,
} from "@/features/kol-matching/services/search-results-filter-service";
import {
  type KolCandidate,
  type SearchResultsFilterState,
  type SocialPlatform,
} from "@/features/kol-matching/types";

export function useSearchResultsFilters(sourceCandidates: KolCandidate[]) {
  const [filters, setFilters] = useState<SearchResultsFilterState>(getDefaultSearchResultsFilterState);

  const filteredCandidates = useMemo(
    () => filterKolCandidatesBySearchFilters(sourceCandidates, filters),
    [sourceCandidates, filters]
  );

  const clearFilters = useCallback(() => {
    setFilters(getDefaultSearchResultsFilterState());
  }, []);

  const togglePlatform = useCallback((platform: SocialPlatform) => {
    setFilters((previous) => {
      const next = previous.platforms.includes(platform)
        ? previous.platforms.filter((p) => p !== platform)
        : [...previous.platforms, platform];
      return { ...previous, platforms: next };
    });
  }, []);

  const toggleNiche = useCallback((nicheId: string) => {
    setFilters((previous) => {
      const next = previous.nicheIds.includes(nicheId)
        ? previous.nicheIds.filter((id) => id !== nicheId)
        : [...previous.nicheIds, nicheId];
      return { ...previous, nicheIds: next };
    });
  }, []);

  const setFollowerMinK = useCallback((followerMinK: number) => {
    setFilters((previous) => ({ ...previous, followerMinK }));
  }, []);

  const setEngagementMinPercent = useCallback((engagementMinPercent: number) => {
    setFilters((previous) => ({ ...previous, engagementMinPercent }));
  }, []);

  return {
    filters,
    filteredCandidates,
    clearFilters,
    togglePlatform,
    toggleNiche,
    setFollowerMinK,
    setEngagementMinPercent,
  };
}