import { type KolMatchingStep } from "@/features/kol-matching/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
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
  { id: "find-entry", label: "Nhập thông tin KOL/KOC", icon: Search },
  { id: "agent-processing", label: "AI Đang xử lý", icon: Bot },
  { id: "search-results", label: "Kết quả Tìm kiếm", icon: ListFilter },
  { id: "kol-comparison", label: "So sánh KOL", icon: Scale },
];

type FlowStepperProps = {
  currentStep: KolMatchingStep;
  className?: string;
  /** When set with `onToggleCollapse`, shows rail collapse control and hides labels when `true`. */
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function FlowStepper({
  currentStep,
  className,
  isCollapsed = false,
  onToggleCollapse,
}: FlowStepperProps) {
  const activeIndex = FLOW_STEPS.findIndex((step) => step.id === currentStep);
  const isCollapsible = Boolean(onToggleCollapse);

  return (
    <Card
      className={cn(
        "rounded-2xl border border-primary-soft bg-card text-foreground shadow-sm",
        className
      )}
    >
      <CardHeader
        className={cn(
          "pb-2",
          isCollapsed && isCollapsible && "border-primary-soft/30 px-3 py-3"
        )}
      >
        {isCollapsible ? (
          <div
            className={cn(
              "flex items-center gap-2",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            {!isCollapsed ? (
              <CardTitle className="text-base">Tiến trình</CardTitle>
            ) : null}
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? "Mở rộng" : "Thu gọn"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary-soft bg-card text-foreground transition-colors hover:bg-primary-soft"
            >
              {isCollapsed ? (
                <ChevronLeft className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        ) : (
          <CardTitle className="text-base">Tiến trình</CardTitle>
        )}
      </CardHeader>
      <CardContent className={cn("pt-1", isCollapsed && isCollapsible && "px-2 pb-3 pt-2")}>
        {isCollapsed && isCollapsible ? (
          <ol className="flex flex-col items-center gap-1">
            {FLOW_STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              const isCompleted = index < activeIndex;
              const StepIcon = step.icon;

              return (
                <li key={step.id} className="relative flex flex-col items-center">
                  {index < FLOW_STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-10 h-3 w-px",
                        isCompleted ? "bg-primary/70" : "bg-primary-soft"
                      )}
                    />
                  ) : null}
                  <div
                    title={step.label}
                    className={cn(
                      "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                      isActive
                        ? "border-primary bg-primary text-background-dark"
                        : isCompleted
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-primary-soft bg-muted/60 text-foreground-muted"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      <StepIcon className="h-4 w-4" aria-hidden />
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
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
                          : "border-primary-soft bg-muted/60 text-foreground-muted"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" aria-hidden />
                    ) : (
                      <StepIcon className="h-4 w-4" aria-hidden />
                    )}
                  </div>

                  <div className="min-w-0 pt-1">
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
                    <p className="text-xs text-foreground-muted">Bước {index + 1}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
