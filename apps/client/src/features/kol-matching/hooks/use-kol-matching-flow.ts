"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getAgentStages,
  processAgentStages,
  searchKolCandidates,
} from "@/features/kol-matching/services/kol-matching-service";
import {
  type FindKolEntryInput,
  type KolCandidate,
  type KolMatchingStep,
} from "@/features/kol-matching/types";

const INITIAL_ENTRY: FindKolEntryInput = {
  campaignOption: "Ra mắt Mùa hè 2024",
  nicheCategory: "Đời sống & Thời trang",
  summary: "",
  campaignName: "",
  creatorType: "both",
  objective: "awareness",
  targetPlatforms: ["tiktok", "youtube"],
  niche: "Làm đẹp",
  targetRegion: "Việt Nam",
  budgetTier: "growth",
  minReach: 50_000,
  minCtr: 2.5,
  conversionTarget: 1.2,
  budgetRangeMaxK: 15,
  followerRangeMaxK: 500,
};

export function useKolMatchingFlow() {
  const [step, setStep] = useState<KolMatchingStep>("find-entry");
  const [entry, setEntry] = useState<FindKolEntryInput>(INITIAL_ENTRY);
  const [processingStageIndex, setProcessingStageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<KolCandidate[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  const stages = useMemo(() => getAgentStages(entry), [entry]);
  const selectedCandidates = useMemo(
    () => results.filter((candidate) => selectedCandidateIds.includes(candidate.id)),
    [results, selectedCandidateIds]
  );

  async function submitEntry(nextEntry: FindKolEntryInput): Promise<void> {
    setEntry(nextEntry);
    setErrorMessage(null);
    setIsLoading(true);
    setStep("agent-processing");
    setProcessingStageIndex(0);
    setSelectedCandidateIds([]);

    const nextStages = getAgentStages(nextEntry);

    try {
      await processAgentStages(nextStages, setProcessingStageIndex);
      const shortlist = await searchKolCandidates(nextEntry);
      setResults(shortlist);
      setStep("search-results");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown processing error";
      setErrorMessage(message);
      setStep("find-entry");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleCandidate(candidateId: string): void {
    setSelectedCandidateIds((previousIds) => {
      if (previousIds.includes(candidateId)) {
        return previousIds.filter((id) => id !== candidateId);
      }
      if (previousIds.length >= 3) return previousIds;
      return [...previousIds, candidateId];
    });
  }

  function goToComparison(): void {
    if (selectedCandidateIds.length < 2) return;
    setStep("kol-comparison");
  }

  function backToResults(): void {
    setStep("search-results");
  }

  function restartFlow(): void {
    setStep("find-entry");
    setResults([]);
    setSelectedCandidateIds([]);
    setErrorMessage(null);
  }

  const inviteSelected = useCallback((): void => {
    if (selectedCandidateIds.length === 0) return;
    // Wire: POST invite / open modal — placeholder for product flow
    console.info("[kol-matching] inviteSelected", { candidateIds: selectedCandidateIds });
  }, [selectedCandidateIds]);

  return {
    step,
    entry,
    stages,
    processingStageIndex,
    isLoading,
    errorMessage,
    results,
    selectedCandidateIds,
    selectedCandidates,
    submitEntry,
    toggleCandidate,
    goToComparison,
    backToResults,
    restartFlow,
    inviteSelected,
  };
}
