"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_KOL_SEARCH_FILTERS,
  filterKolCandidates,
  followerSliderToMinFollowers,
  minFollowersToFollowerSlider,
  type KolSearchFiltersState,
} from "@/features/kol-matching/services/kol-search-filter";
import { type KolCandidate, type SocialPlatform } from "@/features/kol-matching/types";

export function useKolSearchFilters(candidates: KolCandidate[]) {
  const [filters, setFilters] = useState<KolSearchFiltersState>(DEFAULT_KOL_SEARCH_FILTERS);

  const filteredCandidates = useMemo(
    () => filterKolCandidates(candidates, filters),
    [candidates, filters]
  );

  const followerSliderValue = minFollowersToFollowerSlider(filters.minFollowers);

  const togglePlatform = useCallback((platform: SocialPlatform) => {
    setFilters((previous) => {
      if (previous.platformKeys.length === 0) {
        return { ...previous, platformKeys: [platform] };
      }
      if (previous.platformKeys.includes(platform)) {
        const next = previous.platformKeys.filter((item) => item !== platform);
        return { ...previous, platformKeys: next };
      }
      return { ...previous, platformKeys: [...previous.platformKeys, platform] };
    });
  }, []);

  const toggleNicheGroup = useCallback((groupId: string) => {
    setFilters((previous) => {
      const has = previous.nicheGroupIds.includes(groupId);
      const nicheGroupIds = has
        ? previous.nicheGroupIds.filter((item) => item !== groupId)
        : [...previous.nicheGroupIds, groupId];
      return { ...previous, nicheGroupIds };
    });
  }, []);

  const setFollowerSlider = useCallback((sliderValue: number) => {
    setFilters((previous) => ({
      ...previous,
      minFollowers: followerSliderToMinFollowers(sliderValue),
    }));
  }, []);

  const setMinEngagementPercent = useCallback((value: number) => {
    setFilters((previous) => ({ ...previous, minEngagementPercent: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_KOL_SEARCH_FILTERS);
  }, []);

  return {
    filters,
    filteredCandidates,
    followerSliderValue,
    togglePlatform,
    toggleNicheGroup,
    setFollowerSlider,
    setMinEngagementPercent,
    clearFilters,
  };
}
