import { ArrowRight, Bot, CheckCircle2, MessagesSquare } from 'lucide-react';

import type { OnboardingExecutionMode } from '@/features/ai-chat/types/onboarding-types';
import { cn } from '@/lib/utils';

type OnboardingExecutionModeProps = {
  sourceLabel: string;
  onSelect: (mode: OnboardingExecutionMode) => void;
};

const MODES = [
  {
    id: 'automatic',
    title: 'Thực hiện tự động tất cả',
    description:
      'Agent kết nối, tổng hợp dữ liệu và khởi tạo toàn bộ workspace như luồng hiện tại.',
    detail: 'Phù hợp khi bạn muốn có bản nháp hoàn chỉnh nhanh nhất.',
    icon: Bot,
    recommended: true,
  },
  {
    id: 'step_by_step',
    title: 'Nhận phản hồi từng bước',
    description: 'Mỗi đầu việc hoàn tất sẽ dừng lại để bạn chỉnh sửa và gửi xác nhận.',
    detail: 'Phù hợp khi cần kiểm soát kỹ dữ liệu trước khi sang bước tiếp theo.',
    icon: MessagesSquare,
    recommended: false,
  },
] as const satisfies ReadonlyArray<{
  id: OnboardingExecutionMode;
  title: string;
  description: string;
  detail: string;
  icon: typeof Bot;
  recommended: boolean;
}>;

export function OnboardingExecutionMode({
  sourceLabel,
  onSelect,
}: OnboardingExecutionModeProps) {
  return (
    <section
      className='overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-[0_18px_55px_rgba(15,23,42,0.08)]'
      aria-labelledby='execution-mode-title'
    >
      <div className='border-b border-slate-100 bg-[linear-gradient(110deg,#fffaf0,#ffffff)] px-4 py-4 sm:px-5'>
        <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700'>
          Bước thiết lập
        </p>
        <h3
          id='execution-mode-title'
          className='mt-1 text-lg font-extrabold text-foreground'
        >
          Bạn muốn Agent làm việc theo cách nào?
        </h3>
        <p className='mt-1 text-sm leading-6 text-foreground-muted'>
          Nguồn sẽ kết nối: <strong className='text-foreground'>{sourceLabel}</strong>
        </p>
      </div>

      <div className='grid gap-3 p-3 sm:grid-cols-2 sm:p-4'>
        {MODES.map((mode) => {
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              type='button'
              onClick={() => onSelect(mode.id)}
              className={cn(
                'group relative flex min-h-52 touch-manipulation flex-col rounded-2xl border p-4 text-left transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transform-none motion-reduce:transition-none',
                mode.recommended
                  ? 'border-amber-200 bg-amber-50/55 hover:border-amber-300 hover:shadow-[0_12px_30px_rgba(245,158,11,0.12)]'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]',
              )}
            >
              <span className='flex items-start justify-between gap-3'>
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-2xl',
                    mode.recommended
                      ? 'bg-primary text-slate-950'
                      : 'bg-slate-100 text-slate-700',
                  )}
                >
                  <Icon className='size-5' aria-hidden />
                </span>
                {mode.recommended
                  ? (
                    <span className='rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800'>
                      Đề xuất
                    </span>
                  )
                  : null}
              </span>

              <span className='mt-4 block text-base font-extrabold text-foreground'>
                {mode.title}
              </span>
              <span className='mt-1.5 block text-sm leading-5 text-foreground-muted'>
                {mode.description}
              </span>
              <span className='mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500'>
                <CheckCircle2 className='mt-0.5 size-3.5 shrink-0 text-emerald-600' aria-hidden />
                {mode.detail}
              </span>
              <span className='mt-auto flex items-center justify-between pt-4 text-sm font-bold text-amber-800'>
                Chọn chế độ này
                <ArrowRight
                  className='size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none'
                  aria-hidden
                />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
