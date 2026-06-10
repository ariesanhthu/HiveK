"use client";

import { useMemo, useState } from "react";
import { getKolAnalysisDataset, getRadarMetrics } from "@/features/kol-analysis/services/kol-analysis-service";

export type KolAnalysisTab = "overview" | "analytics" | "pipeline";

export function useKolAnalysis() {
  const dataset = useMemo(() => getKolAnalysisDataset(), []);
  const [activeTab, setActiveTab] = useState<KolAnalysisTab>("overview");
  const [selectedProfileId, setSelectedProfileId] = useState(dataset.ranking[0]?.id ?? "");

  const selectedProfile = useMemo(
    () =>
      dataset.profiles.find((profile) => profile.id === selectedProfileId) ??
      dataset.ranking[0],
    [dataset.profiles, dataset.ranking, selectedProfileId]
  );

  const radarMetrics = useMemo(
    () => (selectedProfile ? getRadarMetrics(selectedProfile) : []),
    [selectedProfile]
  );

  return {
    ...dataset,
    activeTab,
    setActiveTab,
    selectedProfile,
    selectedProfileId,
    setSelectedProfileId,
    radarMetrics,
  };
}

