"use client";

import { useState } from "react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { AgentProcessingPanel } from "@/features/kol-matching/components/agent-processing-panel";
import { FindEntryForm } from "@/features/kol-matching/components/find-entry-form";
import { FlowPageHeader } from "@/features/kol-matching/components/flow-page-header";
import { FlowStepper } from "@/features/kol-matching/components/flow-stepper";
import { KolComparisonTable } from "./kol-comparison-table";
import { SearchResultsList } from "@/features/kol-matching/components/search-results-list";
import { useKolMatchingFlow } from "@/features/kol-matching/hooks/use-kol-matching-flow";
import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { useBusinessNavItems } from "@/features/business-dashboard/hooks/use-business-nav-items";
import { cn } from "@/lib/utils";

export function KolMatchingPage() {
  const [isFlowRailCollapsed, setIsFlowRailCollapsed] = useState(false);
  const navItems = useBusinessNavItems();

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

  const isComparisonStep = step === "kol-comparison";

  /** Header: balanced inset. Main column: tight left + small gap before flow rail. */
  const headerPadX = "px-3 md:px-4";
  const mainColumnPad = "pl-3 md:pl-4 pr-2";
  const flowRailPad = "w-full px-3 md:px-4 lg:w-auto lg:px-0 lg:pl-3 lg:pr-3 xl:pr-4";

  const flowAsideClassName = cn(
    "flex shrink-0 flex-col gap-3",
    isFlowRailCollapsed ? "lg:w-[4.5rem]" : "lg:w-[272px]"
  );

  const flowRail = (
    <>
      <FlowStepper
        currentStep={step}
        isCollapsed={isFlowRailCollapsed}
        onToggleCollapse={() => setIsFlowRailCollapsed((previous) => !previous)}
      />
      {step === "search-results" && !isFlowRailCollapsed ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={restartFlow}
            className="rounded-xl border border-primary-soft px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary-soft"
          >
            New search
          </button>
          <button
            type="button"
            onClick={goToComparison}
            disabled={selectedCandidateIds.length < 2}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-background-dark transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            Compare selected
          </button>
        </div>
      ) : null}
      {step === "search-results" && isFlowRailCollapsed ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={restartFlow}
            title="New search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-primary-soft text-foreground transition-colors hover:bg-primary-soft"
          >
            <span className="sr-only">New search</span>
            <RefreshCw className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goToComparison}
            disabled={selectedCandidateIds.length < 2}
            title="Compare selected"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-background-dark transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="sr-only">Compare selected</span>
            <ArrowLeftRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );

  return (
    <main className="flex min-h-screen w-full bg-background-light">
      <DashboardSidebar items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col gap-3 pb-10 pt-6 md:pt-8">
        <div className={headerPadX}>
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
          />
        </div>

        {isComparisonStep ? (
          <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
            <section className={cn("order-1 min-w-0 flex-1 lg:min-h-0", mainColumnPad)}>
              <KolComparisonTable
                candidates={selectedCandidates}
                onBack={backToResults}
                onRestart={restartFlow}
              />
            </section>
            <aside
              className={cn(
                flowAsideClassName,
                "order-2 border-primary-soft lg:sticky lg:top-6 lg:self-start lg:border-l lg:bg-background-light",
                flowRailPad
              )}
            >
              {flowRail}
            </aside>
          </div>
        ) : (
          <div className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
            <section className={cn("order-2 min-w-0 flex-1 space-y-4 lg:order-1", mainColumnPad)}>
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
            </section>

            <aside
              className={cn(
                flowAsideClassName,
                "order-1 border-primary-soft lg:order-2 lg:sticky lg:top-6 lg:self-start lg:border-l lg:bg-background-light",
                flowRailPad
              )}
            >
              {flowRail}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
