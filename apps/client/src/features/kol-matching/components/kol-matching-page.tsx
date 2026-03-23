"use client";

import { AgentProcessingPanel } from "@/features/kol-matching/components/agent-processing-panel";
import { FindEntryForm } from "@/features/kol-matching/components/find-entry-form";
import { FlowPageHeader } from "@/features/kol-matching/components/flow-page-header";
import { FlowStepper } from "@/features/kol-matching/components/flow-stepper";
import { KolComparisonTable } from "./kol-comparison-table";
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
    inviteSelected,
  } = useKolMatchingFlow();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-10 pt-8 md:px-6">
      <FlowPageHeader
        nav={
          step === "find-entry" ? (
            <nav className="flex items-center gap-2 text-sm text-foreground-muted">
              <span>Dashboard</span>
              <span>/</span>
              <span className="font-medium text-primary">Find KOL/KOC</span>
            </nav>
          ) : null
        }
        title={
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {step === "find-entry" ? "Discover Creators" : "KOL/KOC Matching"}
          </h1>
        }
        actions={
          step === "search-results" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={restartFlow}
                className="rounded-lg border border-primary-soft px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-primary-soft"
              >
                New search
              </button>
              <button
                type="button"
                onClick={goToComparison}
                disabled={selectedCandidateIds.length < 2}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-background-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Compare selected
              </button>
            </div>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-start">
        <section className="order-2 space-y-4 lg:order-1">
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
              onInviteSelected={inviteSelected}
            />
          ) : null}

          {step === "kol-comparison" ? (
            <KolComparisonTable
              candidates={selectedCandidates}
              onBack={backToResults}
              onRestart={restartFlow}
            />
          ) : null}
        </section>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
          <FlowStepper currentStep={step} />
        </aside>
      </div>
    </main>
  );
}
