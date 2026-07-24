import type { SetupStepId } from '@/features/ai-chat/types';
import { Check, FolderOpen, Link2, Palette } from 'lucide-react';

type SetupStepReceiptProps = {
  step: SetupStepId;
  title: string;
  detail: string;
};

const STEP_ICONS = {
  social: Link2,
  brand: Palette,
  drive: FolderOpen,
};

export function SetupStepReceipt({
  step,
  title,
  detail,
}: SetupStepReceiptProps) {
  const Icon = STEP_ICONS[step];

  return (
    <div className='mt-3 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 sm:p-4'>
      <span className='relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm'>
        <Icon className='size-4' aria-hidden />
        <span className='absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white'>
          <Check className='size-2.5' strokeWidth={3} aria-hidden />
        </span>
      </span>
      <span className='min-w-0'>
        <span className='block text-xs font-extrabold text-emerald-800'>
          {title}
        </span>
        <span className='mt-0.5 block truncate text-[11px] text-emerald-700/80 sm:text-xs'>
          {detail}
        </span>
      </span>
    </div>
  );
}
