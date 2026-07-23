import { Card, CardContent } from '@/components/ui/card';
import { KOL_ANALYSIS_WEIGHTS, METRIC_GUIDE, PIPELINE_STEPS } from '@/data/kol-analysis';
import { cn } from '@/lib/utils';

function getMetricToneClass(tone: string) {
  if (tone === 'good') return 'border-l-green-500 bg-green-50 text-green-800';
  if (tone === 'warn') return 'border-l-amber-500 bg-amber-50 text-amber-800';
  return 'border-l-primary bg-primary-soft text-foreground';
}

export function PipelineGuidePanel() {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-primary-soft bg-card p-5 shadow-sm'>
        <h2 className='text-xl font-bold text-foreground'>Pipeline Overview</h2>
        <div className='mt-4 flex flex-wrap items-center gap-2 text-sm'>
          {PIPELINE_STEPS.map((step, index) => (
            <div key={step.id} className='flex items-center gap-2'>
              <span className='rounded-full bg-muted px-3 py-1.5 font-semibold text-foreground'>
                {step.title.replace(/^\d+\.\s*/, '')}
              </span>
              {index < PIPELINE_STEPS.length - 1
                ? (
                  <span
                    className='material-symbols-outlined text-base text-foreground-muted'
                    aria-hidden
                  >
                    arrow_forward
                  </span>
                )
                : null}
            </div>
          ))}
        </div>
      </section>

      <section className='space-y-3'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>Pipeline Explanation</h2>
          <p className='text-sm text-foreground-muted'>
            Converted from the Streamlit expanders into native disclosure panels.
          </p>
        </div>

        <div className='grid gap-3 lg:grid-cols-2'>
          {PIPELINE_STEPS.map((step, index) => (
            <details
              key={step.id}
              open={index === 0}
              className='group rounded-2xl border border-primary-soft bg-card p-4 shadow-sm'
            >
              <summary className='flex cursor-pointer list-none items-center justify-between gap-3'>
                <span className='font-bold text-foreground'>{step.title}</span>
                <span className='material-symbols-outlined text-lg text-foreground-muted transition-transform group-open:rotate-180'>
                  expand_more
                </span>
              </summary>
              <div className='mt-3 space-y-2 text-sm leading-6 text-foreground-muted'>
                <p>{step.summary}</p>
                <p>{step.details}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className='space-y-3'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>Metric Meaning</h2>
          <p className='text-sm text-foreground-muted'>
            Atomic signals used by the evaluation stage and final score formula.
          </p>
        </div>

        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {METRIC_GUIDE.map((metric) => (
            <Card key={metric.title}>
              <CardContent className='p-4'>
                <div
                  className={cn(
                    'rounded-xl border-l-4 px-3 py-2',
                    getMetricToneClass(metric.tone),
                  )}
                >
                  <h3 className='font-bold'>{metric.title}</h3>
                  <p className='mt-1 text-sm leading-6'>{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-primary-soft bg-card p-5 shadow-sm'>
        <h2 className='text-xl font-bold text-foreground'>KOL Score Formula</h2>
        <p className='mt-3 rounded-xl bg-muted px-4 py-3 font-mono text-sm text-foreground'>
          KOL Score = w1 * Sentiment + w2 * Engagement + w3 * Topic Authority + w4 * Controversy
          Safety
        </p>
        <p className='mt-3 text-sm text-foreground-muted'>
          Current weights: w1={KOL_ANALYSIS_WEIGHTS.sentiment}, w2=
          {KOL_ANALYSIS_WEIGHTS.engagement}, w3={KOL_ANALYSIS_WEIGHTS.topic}, w4=
          {KOL_ANALYSIS_WEIGHTS.risk}
        </p>
      </section>
    </div>
  );
}
