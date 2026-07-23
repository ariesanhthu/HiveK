'use client';

import { AlertCircle, Check, Circle, LoaderCircle, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type {
  InitializationChecklist,
  OnboardingExecutionMode,
  OnboardingStorageStatus,
} from '@/features/ai-chat/types/onboarding-types';
import { cn } from '@/lib/utils';

type OnboardingInitializationCardProps = {
  checklist: InitializationChecklist;
  storageStatus: OnboardingStorageStatus;
  isFinalizing?: boolean;
  finalizationError?: string | null;
  executionMode: OnboardingExecutionMode;
  onConfirmStep: (note: string) => void;
  onRetry: () => void;
};

export function OnboardingInitializationCard({
  checklist,
  storageStatus,
  isFinalizing = false,
  finalizationError = null,
  executionMode,
  onConfirmStep,
  onRetry,
}: OnboardingInitializationCardProps) {
  const completedCount = checklist.steps.filter(
    (step) => step.status === 'complete',
  ).length;
  const reviewStep = checklist.steps.find(
    (step) => step.status === 'needs_input',
  );
  const [reviewNote, setReviewNote] = useState(reviewStep?.note ?? '');
  const hasIssue = Boolean(finalizationError)
    || checklist.steps.some((step) => step.status === 'failed');

  useEffect(() => {
    setReviewNote(reviewStep?.note ?? '');
  }, [reviewStep?.id, reviewStep?.note]);

  return (
    <section
      className='overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-[0_18px_55px_rgba(15,23,42,0.08)]'
      aria-labelledby='initialization-title'
    >
      <div className='border-b border-slate-100 bg-[linear-gradient(110deg,#fffaf0,#ffffff)] px-4 py-4 sm:px-5'>
        <div className='flex items-start gap-3'>
          <span className='relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-amber-800'>
            <Sparkles className='size-5' aria-hidden />
            {checklist.status === 'running'
              ? (
                <span className='absolute -right-1 -top-1 size-3 animate-pulse rounded-full border-2 border-white bg-emerald-500 motion-reduce:animate-none' />
              )
              : null}
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700'>
              Đang chuẩn bị workspace
            </p>
            <h3
              id='initialization-title'
              className='mt-1 text-base font-extrabold text-foreground'
            >
              Khởi tạo tất cả hồ sơ liên quan
            </h3>
            <p className='mt-1 text-xs leading-5 text-foreground-muted sm:text-sm'>
              Đã hoàn tất {completedCount}/{checklist.steps.length}{' '}
              đầu việc. Mỗi kết quả sẽ vẫn ở trạng thái chờ bạn kiểm tra.
            </p>
          </div>
        </div>
      </div>

      <ol className='space-y-1 p-3 sm:p-4' aria-label='Tiến trình khởi tạo'>
        {checklist.steps.map((step, index) => {
          const isActive = step.status === 'in_progress';
          const isComplete = step.status === 'complete';
          const isReview = step.status === 'needs_input';
          const isIssue = step.status === 'failed';

          return (
            <li
              key={step.id}
              className={cn(
                'flex gap-3 rounded-2xl border px-3 py-3 transition-colors',
                isActive && 'border-amber-200 bg-amber-50/70',
                isReview && 'border-amber-200 bg-amber-50/70',
                isComplete && 'border-emerald-100 bg-emerald-50/45',
                isIssue && 'border-rose-200 bg-rose-50/70',
                step.status === 'pending' && 'border-transparent bg-slate-50/65',
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
                  isActive && 'border-amber-300 bg-primary text-slate-950',
                  isReview && 'border-amber-300 bg-amber-100 text-amber-800',
                  isComplete
                    && 'border-emerald-200 bg-emerald-600 text-white',
                  isIssue && 'border-rose-200 bg-rose-100 text-rose-700',
                  step.status === 'pending'
                    && 'border-slate-200 bg-white text-slate-400',
                )}
                aria-hidden
              >
                {isActive
                  ? <LoaderCircle className='size-4 animate-spin motion-reduce:animate-none' />
                  : isComplete
                  ? <Check className='size-4' strokeWidth={2.8} />
                  : isReview
                  ? <Check className='size-4' strokeWidth={2.4} />
                  : isIssue
                  ? <AlertCircle className='size-4' />
                  : <Circle className='size-3' />}
              </span>
              <span className='min-w-0 flex-1'>
                <span className='flex flex-wrap items-center justify-between gap-2'>
                  <span className='text-sm font-bold text-foreground'>
                    {step.label}
                  </span>
                  <span className='text-[10px] font-bold uppercase tracking-wide text-slate-400'>
                    {isActive
                      ? 'Đang xử lý'
                      : isComplete
                      ? 'Hoàn tất'
                      : step.status === 'needs_input'
                      ? 'Chờ xác nhận'
                      : step.status === 'failed'
                      ? 'Cần thử lại'
                      : `Bước ${index + 1}`}
                  </span>
                </span>
                <span className='mt-0.5 block text-xs leading-5 text-foreground-muted'>
                  {step.note ?? step.description}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {executionMode === 'step_by_step' && reviewStep
        ? (
          <div className='mx-3 mb-4 rounded-2xl border border-amber-200 bg-amber-50/65 p-3 sm:mx-4 sm:p-4'>
            <label
              htmlFor='initialization-review-note'
              className='text-sm font-extrabold text-foreground'
            >
              Kiểm tra kết quả: {reviewStep.label}
            </label>
            <p className='mt-1 text-xs leading-5 text-foreground-muted'>
              Bạn có thể chỉnh nội dung Agent ghi nhận trước khi xác nhận sang bước tiếp theo.
            </p>
            <textarea
              id='initialization-review-note'
              value={reviewNote}
              onChange={(event) => setReviewNote(event.target.value)}
              rows={3}
              className='mt-3 w-full resize-y rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm leading-6 text-foreground outline-none transition-shadow placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-primary/25'
            />
            <Button
              type='button'
              onClick={() => onConfirmStep(reviewNote.trim())}
              disabled={!reviewNote.trim()}
              className='mt-3 w-full'
            >
              <Check className='size-4' aria-hidden />
              Xác nhận và tiếp tục
            </Button>
          </div>
        )
        : null}

      {finalizationError
        ? (
          <div
            className='mx-4 mb-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800'
            role='alert'
          >
            <AlertCircle className='mt-0.5 size-4 shrink-0' aria-hidden />
            <span>{finalizationError}</span>
          </div>
        )
        : null}

      {hasIssue
        ? (
          <div className='border-t border-slate-100 p-4'>
            <Button variant='outline' onClick={onRetry} className='w-full'>
              <RotateCcw className='size-4' aria-hidden />
              {finalizationError
                ? 'Thử lưu và mở workspace'
                : 'Thử lại bước đang dừng'}
            </Button>
          </div>
        )
        : isFinalizing
        ? (
          <p className='flex items-center justify-center gap-2 border-t border-amber-100 bg-amber-50 px-4 py-3 text-center text-[11px] font-semibold text-amber-900'>
            <LoaderCircle
              className='size-3.5 animate-spin motion-reduce:animate-none'
              aria-hidden
            />
            Đang lưu snapshot và chuẩn bị mở workspace…
          </p>
        )
        : (
          <p
            className={`border-t px-4 py-3 text-center text-[11px] ${
              storageStatus === 'unavailable'
                ? 'border-amber-100 bg-amber-50 text-amber-900'
                : 'border-slate-100 text-slate-500'
            }`}
          >
            {storageStatus === 'unavailable'
              ? 'Trình duyệt không cho phép lưu tiến trình; hãy giữ trang này mở đến khi hoàn tất.'
              : 'Bạn có thể rời trang; tiến trình hiện tại đã được lưu trên trình duyệt.'}
          </p>
        )}
    </section>
  );
}
