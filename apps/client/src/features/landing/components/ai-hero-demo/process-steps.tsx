import { type ProcessStepDef, stepStatus } from './hero-demo-data';

/**
 * The vertical connector line fills green up to the current step, matching
 * the source prototype's `computeSteps()` gradient.
 */
function lineGradient(currentStep: number, stepCount: number) {
  const progressPct = ((currentStep - 1) / (stepCount - 1)) * 100;
  return `linear-gradient(to bottom, #22c55e 0%, #22c55e ${progressPct}%, rgba(15,23,42,0.10) ${progressPct}%, rgba(15,23,42,0.10) 100%)`;
}

export function ProcessSteps({
  title,
  steps,
  currentStep,
}: {
  title: string;
  steps: ProcessStepDef[];
  currentStep: number;
}) {
  return (
    <div className='mt-2'>
      <div className='flex items-center gap-1.5 text-[0.76rem] font-bold tracking-wide text-primary'>
        <span className='material-symbols-outlined text-[15px]' aria-hidden>
          bolt
        </span>
        QUY TRÌNH TỰ ĐỘNG
      </div>
      <div className='my-2.5 text-lg font-extrabold text-foreground'>{title}</div>
      <div className='relative'>
        <div
          className='absolute bottom-[18px] left-[17px] top-[18px] z-0 w-0.5 transition-[background] duration-400'
          style={{ background: lineGradient(currentStep, steps.length) }}
        />
        <ul className='relative z-10 flex flex-col'>
          {steps.map((step, i) => {
            const status = stepStatus(i, currentStep);
            const circleBg = status === 'done'
              ? 'rgba(34,197,94,0.14)'
              : status === 'active'
              ? step.brand
              : 'var(--color-muted)';
            const circleColor = status === 'done'
              ? '#16a34a'
              : status === 'active'
              ? step.activeColor
              : '#94a3b8';
            const circleBorder = status === 'pending'
              ? '1.5px solid rgba(15,23,42,0.10)'
              : status === 'done'
              ? '1.5px solid rgba(34,197,94,0.35)'
              : '1.5px solid transparent';
            const ringShadow = status === 'active' ? `0 0 0 5px ${step.ring}` : 'none';
            return (
              <li
                key={step.title}
                className='flex items-start gap-3.5'
                style={{ paddingBottom: i === steps.length - 1 ? 0 : 26 }}
              >
                <span
                  className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black text-[0.95rem] transition-all duration-300'
                  style={{
                    background: circleBg,
                    color: circleColor,
                    border: circleBorder,
                    boxShadow: ringShadow,
                  }}
                >
                  {status === 'done'
                    ? (
                      <span className='material-symbols-outlined text-[18px]' aria-hidden>
                        check
                      </span>
                    )
                    : step.letter
                    ? (
                      step.letter
                    )
                    : (
                      <span className='material-symbols-outlined text-base' aria-hidden>
                        {step.icon}
                      </span>
                    )}
                </span>
                <span>
                  <span
                    className='block text-sm font-bold transition-colors duration-300'
                    style={{ color: status === 'pending' ? '#94a3b8' : 'var(--color-foreground)' }}
                  >
                    {step.title}
                  </span>
                  <span
                    className='mt-0.5 block text-xs transition-colors duration-300'
                    style={{
                      color: status === 'pending' ? '#cbd5e1' : 'var(--color-foreground-muted)',
                    }}
                  >
                    {step.desc}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
