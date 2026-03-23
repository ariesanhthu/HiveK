import { type KolMatchingStep } from "@/features/kol-matching/types";

type FlowStep = {
  id: KolMatchingStep;
  label: string;
};

const FLOW_STEPS: FlowStep[] = [
  { id: "find-entry", label: "Find KOL/KOC Entry" },
  { id: "agent-processing", label: "Agent Processing" },
  { id: "search-results", label: "KOL Search Results" },
  { id: "kol-comparison", label: "KOL Comparison" },
];

type FlowStepperProps = {
  currentStep: KolMatchingStep;
};

export function FlowStepper({ currentStep }: FlowStepperProps) {
  const activeIndex = FLOW_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <ol className="grid gap-2 md:grid-cols-4">
      {FLOW_STEPS.map((step, index) => {
        const isActive = index === activeIndex;
        const isCompleted = index < activeIndex;

        return (
          <li
            key={step.id}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              isActive
                ? "border-primary bg-primary text-background-dark"
                : isCompleted
                  ? "border-primary-soft bg-primary-soft text-foreground"
                  : "border-primary-soft bg-card text-foreground-muted"
            }`}
          >
            {index + 1}. {step.label}
          </li>
        );
      })}
    </ol>
  );
}
