import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { type AgentStep } from "@/features/campaign-planning/types/campaign-planning";
import { cn } from "@/lib/utils";

type AgentProgressCardProps = {
  progress: number;
  steps: AgentStep[];
};

const STEP_ICON = {
  done: CheckCircle2,
  active: Loader2,
  queued: Circle,
};

export function AgentProgressCard({ progress, steps }: AgentProgressCardProps) {
  return (
    <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full bg-primary" />
          <p className="truncate text-xs font-bold text-foreground">
            Agent AI đang tối ưu hoá kế hoạch đăng bài...
          </p>
        </div>
        <span className="text-xs font-bold text-amber-700">{progress}%</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-4 space-y-2.5">
        {steps.map((step) => {
          const Icon = STEP_ICON[step.status];

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 text-xs",
                step.status === "queued" ? "text-muted" : "text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-3.5 shrink-0",
                  step.status === "done" ? "text-emerald-600" : null,
                  step.status === "active" ? "animate-spin text-primary" : null
                )}
                aria-hidden
              />
              <span className={step.status === "active" ? "font-semibold" : undefined}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
