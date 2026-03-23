"use client";

import { AgentProcessingPanel } from "@/features/kol-matching/components/agent-processing-panel";
import { FindEntryForm } from "@/features/kol-matching/components/find-entry-form";
import { FlowStepper } from "@/features/kol-matching/components/flow-stepper";
import { KolComparisonTable } from "@/features/kol-matching/components/kol-comparison-table";
import { SearchResultsList } from "@/features/kol-matching/components/search-results-list";
import { useKolMatchingFlow } from "@/features/kol-matching/hooks/use-kol-matching-flow";

export function KolMatchingPage() {
  const {
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
  } = useKolMatchingFlow();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-10 pt-8 md:px-6">
      <header className="space-y-2">
        {step === "find-entry" ? (
          <>
            <nav className="flex items-center gap-2 text-sm text-foreground-muted">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-primary">Find KOL/KOC</span>
            </nav>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Discover Creators
            </h1>
          
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              KOL/KOC Matching
            </h1>
          </>
        )}
      </header>

      <FlowStepper currentStep={step} />

      {step === "find-entry" ? (
        <FindEntryForm
          initialValue={entry}
          isSubmitting={isLoading}
          errorMessage={errorMessage}
          onSubmit={submitEntry}
        />
      ) : null}

      {step === "agent-processing" ? (
        <AgentProcessingPanel
          stages={stages}
          activeStageIndex={processingStageIndex}
        />
      ) : null}

      {step === "search-results" ? (
        <SearchResultsList
          candidates={results}
          selectedCandidateIds={selectedCandidateIds}
          onToggleCandidate={toggleCandidate}
          onCompare={goToComparison}
          onRestart={restartFlow}
        />
      ) : null}

      {step === "kol-comparison" ? (
        <KolComparisonTable
          candidates={selectedCandidates}
          onBack={backToResults}
          onRestart={restartFlow}
        />
      ) : null}
    </main>
  );
}
