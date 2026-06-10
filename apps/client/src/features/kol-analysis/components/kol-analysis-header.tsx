import { KOL_ANALYSIS_WEIGHTS } from "@/data/kol-analysis";

export function KolAnalysisHeader() {
  return (
    <header className="space-y-4">
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <span>Dashboard</span>
        <span>/</span>
        <span className="font-medium text-primary">KOL Analysis</span>
      </nav>

      <div className="flex flex-col gap-4 rounded-2xl border border-primary-soft bg-card p-5 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Social Listening Pipeline
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            KOL/KOC Analytics Dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            Static overview for metadata collection priorities, scoring logic,
            and creator performance across platforms and niches.
          </p>
        </div>

        <div className="grid gap-2 text-xs text-foreground-muted sm:grid-cols-2 lg:w-[25rem]">
          <div className="rounded-xl bg-primary-soft px-3 py-2">
            <span className="font-semibold text-foreground">Score model</span>
            <p>Sentiment + Engagement + Topic + Safety</p>
          </div>
          <div className="rounded-xl bg-muted px-3 py-2">
            <span className="font-semibold text-foreground">Weights</span>
            <p>
              {KOL_ANALYSIS_WEIGHTS.sentiment} / {KOL_ANALYSIS_WEIGHTS.engagement} /{" "}
              {KOL_ANALYSIS_WEIGHTS.topic} / {KOL_ANALYSIS_WEIGHTS.risk}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

