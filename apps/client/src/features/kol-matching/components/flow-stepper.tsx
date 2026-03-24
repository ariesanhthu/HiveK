import { type KolMatchingStep } from "@/features/kol-matching/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  ListFilter,
  type LucideIcon,
  Search,
  Scale,
} from "lucide-react";

type FlowStep = {
  id: KolMatchingStep;
  label: string;
  icon: LucideIcon;
};

const FLOW_STEPS: FlowStep[] = [
  { id: "find-entry", label: "Find KOL/KOC Entry", icon: Search },
  { id: "agent-processing", label: "Agent Processing", icon: Bot },
  { id: "search-results", label: "KOL Search Results", icon: ListFilter },
  { id: "kol-comparison", label: "KOL Comparison", icon: Scale },
];

type FlowStepperProps = {
  currentStep: KolMatchingStep;
  className?: string;
};

export function FlowStepper({ currentStep, className }: FlowStepperProps) {
  const activeIndex = FLOW_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <Card className={cn("rounded-2xl bg-primary", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Flow Progress</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <ol className="flex flex-col gap-3">
          {FLOW_STEPS.map((step, index) => {
            const isActive = index === activeIndex;
            const isCompleted = index < activeIndex;
            const StepIcon = step.icon;

            return (
              <li key={step.id} className="relative flex items-start gap-3">
                {index < FLOW_STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-5 top-10 h-10 w-px",
                      isCompleted ? "bg-primary/70" : "bg-primary-soft"
                    )}
                  />
                ) : null}

                <div
                  className={cn(
                    "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isActive
                      ? "border-primary bg-primary text-background-dark"
                      : isCompleted
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-primary-soft bg-card text-foreground-muted"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <StepIcon className="h-4 w-4" aria-hidden />
                  )}
                </div>

                <div className="pt-1">
                  <p
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      isActive || isCompleted
                        ? "text-foreground"
                        : "text-foreground-muted"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Step {index + 1}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
