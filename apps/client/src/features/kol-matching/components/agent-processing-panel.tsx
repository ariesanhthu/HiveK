import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type AgentStage } from "@/features/kol-matching/types";

type AgentProcessingPanelProps = {
  stages: AgentStage[];
  activeStageIndex: number;
};

export function AgentProcessingPanel({
  stages,
  activeStageIndex,
}: AgentProcessingPanelProps) {
  const progress = ((activeStageIndex + 1) / Math.max(stages.length, 1)) * 100;
  const activeStage = stages[activeStageIndex];
  const logs = stages.slice(0, activeStageIndex + 1).map((stage, index) => ({
    id: `log-${stage.id}`,
    at: `${String(9 + index).padStart(2, "0")}:${String(12 + index * 3).padStart(2, "0")}`,
    message:
      index === activeStageIndex
        ? `${stage.label}...`
        : `${stage.label} completed successfully.`,
    level: index === activeStageIndex ? "processing" : "success",
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card>
        <CardHeader className="items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <span className="material-symbols-outlined text-lg">tips_and_updates</span>
          </span>
          <CardTitle>Analyzing your brief</CardTitle>
          <CardDescription>
            Our AI agent is processing your requirements to find the best matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span>Processing Algorithms</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-primary-soft">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="space-y-3">
            {stages.map((stage, index) => {
              const isActive = index === activeStageIndex;
              const isCompleted = index < activeStageIndex;

              return (
                <li key={stage.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isCompleted
                        ? "border-emerald-300 bg-emerald-100 text-emerald-600"
                        : isActive
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-primary-soft bg-card text-foreground-muted"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isCompleted ? "check" : isActive ? "sync" : "schedule"}
                    </span>
                  </span>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-semibold ${
                        isActive || isCompleted ? "text-foreground" : "text-foreground-muted"
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {isCompleted ? "Completed" : isActive ? "Active - identifying influencers..." : "Pending"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="rounded-xl border border-primary-soft bg-muted px-3 py-2 text-xs text-foreground-muted">
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-primary">lightbulb</span>
              We prioritize niche fit, performance history, rating, and budget compatibility
              to ensure the best ROI.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Output (Log)</CardTitle>
          <CardDescription>
            Real-time execution logs từ matching agent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border border-primary-soft bg-muted px-3 py-2">
            <p className="text-xs font-semibold text-foreground">Current stage</p>
            <p className="text-sm font-medium text-primary">{activeStage?.label ?? "Initializing..."}</p>
            <p className="mt-1 text-xs text-foreground-muted">{activeStage?.detail}</p>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-primary-soft bg-card p-2">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-primary-soft bg-muted px-2.5 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-foreground-muted">{log.at}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      log.level === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-primary-soft text-primary"
                    }`}
                  >
                    {log.level}
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground">{log.message}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-foreground-muted">
            Streaming logs will continue until shortlist generation is completed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
