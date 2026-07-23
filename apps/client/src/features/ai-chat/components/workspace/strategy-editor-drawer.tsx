'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDrawerDialog } from '@/features/ai-chat/components/workspace/use-drawer-dialog';
import type {
  NinetyDayStrategy,
  NinetyDayStrategyPatch,
  StrategyPriority,
} from '@/features/ai-chat/types/workspace-types';
import { CheckCircle2, FileText, Save, ShieldCheck, X } from 'lucide-react';
import { type FormEvent, useEffect, useId, useState } from 'react';

type StrategyEditorDrawerProps = {
  strategy: NinetyDayStrategy;
  onClose: () => void;
  onUpdate: (patch: NinetyDayStrategyPatch) => void;
  onConfirm: () => void;
};

type StrategyEditorDraft = {
  title: string;
  startDate: string;
  endDate: string;
  timezone: string;
  northStar: string;
  objectives: string;
  priorityStatuses: Record<string, StrategyPriority['status']>;
};

const PRIORITY_STATUS_OPTIONS: {
  value: StrategyPriority['status'];
  label: string;
}[] = [
  { value: 'not_started', label: 'Chưa bắt đầu' },
  { value: 'in_progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Đã hoàn tất' },
  { value: 'blocked', label: 'Đang bị chặn' },
];

function createDraft(strategy: NinetyDayStrategy): StrategyEditorDraft {
  return {
    title: strategy.title,
    startDate: strategy.startDate,
    endDate: strategy.endDate,
    timezone: strategy.timezone,
    northStar: strategy.northStar,
    objectives: strategy.objectives.join('\n'),
    priorityStatuses: Object.fromEntries(
      strategy.priorities.map((priority) => [priority.id, priority.status]),
    ),
  };
}

function splitLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function createPatch(
  draft: StrategyEditorDraft,
  strategy: NinetyDayStrategy,
): NinetyDayStrategyPatch {
  return {
    title: draft.title.trim(),
    startDate: draft.startDate,
    endDate: draft.endDate,
    timezone: draft.timezone.trim(),
    northStar: draft.northStar.trim(),
    objectives: splitLines(draft.objectives),
    priorities: strategy.priorities.map((priority) => ({
      ...priority,
      status: draft.priorityStatuses[priority.id] ?? priority.status,
    })),
  };
}

function isPatchDifferent(
  patch: NinetyDayStrategyPatch,
  strategy: NinetyDayStrategy,
): boolean {
  const current: NinetyDayStrategyPatch = {
    title: strategy.title,
    startDate: strategy.startDate,
    endDate: strategy.endDate,
    timezone: strategy.timezone,
    northStar: strategy.northStar,
    objectives: strategy.objectives,
    priorities: strategy.priorities,
  };

  return JSON.stringify(patch) !== JSON.stringify(current);
}

function validateDraft(draft: StrategyEditorDraft): string | null {
  if (!draft.title.trim()) return 'Tên kế hoạch không được để trống.';
  if (!draft.startDate || !draft.endDate) {
    return 'Cần chọn đầy đủ ngày bắt đầu và ngày kết thúc.';
  }
  if (draft.endDate < draft.startDate) {
    return 'Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.';
  }
  if (!draft.timezone.trim()) return 'Múi giờ không được để trống.';
  if (!draft.northStar.trim()) return 'North star không được để trống.';
  if (splitLines(draft.objectives).length === 0) {
    return 'Cần giữ lại ít nhất một mục tiêu.';
  }
  return null;
}

export function StrategyEditorDrawer({
  strategy,
  onClose,
  onUpdate,
  onConfirm,
}: StrategyEditorDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const feedbackId = useId();
  const fieldPrefix = useId();
  const [draft, setDraft] = useState<StrategyEditorDraft>(() => createDraft(strategy));
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setDraft(createDraft(strategy));
    setError(null);
  }, [strategy]);

  const patch = createPatch(draft, strategy);
  const hasChanged = isPatchDifferent(patch, strategy);
  const isAlreadyConfirmed = strategy.status === 'confirmed';
  const { dialogRef, requestClose } = useDrawerDialog({
    isOpen: true,
    hasUnsavedChanges: hasChanged,
    onClose,
    discardMessage: 'Bạn có thay đổi chiến lược chưa lưu. Đóng và bỏ các thay đổi này?',
  });

  function saveDraft(): void {
    const validationError = validateDraft(draft);
    if (validationError) {
      setError(validationError);
      setFeedback(null);
      return;
    }

    onUpdate(patch);
    setError(null);
    setFeedback('Đã lưu bản chỉnh sửa. Kế hoạch cần được xác nhận trước khi vận hành.');
  }

  function saveAndConfirm(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const validationError = validateDraft(draft);
    if (validationError) {
      setError(validationError);
      setFeedback(null);
      return;
    }

    if (hasChanged) onUpdate(patch);
    onConfirm();
    onClose();
  }

  return (
    <div className='fixed inset-0 z-[60] flex justify-end'>
      <button
        type='button'
        className='absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]'
        onClick={requestClose}
        aria-label='Đóng trình chỉnh sửa chiến lược'
      />
      <section
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className='relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-slate-200 bg-card shadow-2xl'
      >
        <header className='flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6'>
          <div className='min-w-0'>
            <p className='text-[11px] font-extrabold uppercase tracking-[0.12em] text-amber-700'>
              Chiến lược 90 ngày
            </p>
            <h2 id={titleId} className='mt-1 text-xl font-extrabold text-foreground'>
              Chỉnh sửa và xác nhận kế hoạch
            </h2>
            <p
              id={descriptionId}
              className='mt-1 max-w-xl text-xs leading-5 text-foreground-muted'
            >
              Chỉnh các quyết định cốt lõi và tiến độ ưu tiên. Lưu bản nháp không đồng nghĩa với xác
              nhận hay xuất bản.
            </p>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={requestClose}
            aria-label='Đóng'
          >
            <X className='size-4' aria-hidden />
          </Button>
        </header>

        <form
          className='flex min-h-0 flex-1 flex-col'
          onSubmit={saveAndConfirm}
          aria-describedby={error || feedback ? feedbackId : undefined}
        >
          <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge variant={isAlreadyConfirmed ? 'success' : 'warning'}>
                {isAlreadyConfirmed ? 'Đã xác nhận' : 'Cần xác nhận'}
              </Badge>
              <Badge variant='outline'>
                {strategy.provenance.length} dấu vết nguồn
              </Badge>
              {hasChanged ? <Badge variant='secondary'>Có thay đổi chưa lưu</Badge> : null}
            </div>

            {error || feedback
              ? (
                <p
                  id={feedbackId}
                  role={error ? 'alert' : 'status'}
                  className={`mt-4 rounded-xl border px-3 py-2 text-xs leading-5 ${
                    error
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {error ?? feedback}
                </p>
              )
              : null}

            <div className='mt-5 grid gap-4 sm:grid-cols-2'>
              <div className='sm:col-span-2'>
                <Label htmlFor={`${fieldPrefix}-title`} className='text-xs font-bold'>
                  Tên kế hoạch
                </Label>
                <Input
                  id={`${fieldPrefix}-title`}
                  data-drawer-initial-focus
                  className='mt-2'
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))}
                />
              </div>

              <div>
                <Label htmlFor={`${fieldPrefix}-start`} className='text-xs font-bold'>
                  Ngày bắt đầu
                </Label>
                <Input
                  id={`${fieldPrefix}-start`}
                  type='date'
                  className='mt-2'
                  value={draft.startDate}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))}
                />
              </div>
              <div>
                <Label htmlFor={`${fieldPrefix}-end`} className='text-xs font-bold'>
                  Ngày kết thúc
                </Label>
                <Input
                  id={`${fieldPrefix}-end`}
                  type='date'
                  className='mt-2'
                  min={draft.startDate}
                  value={draft.endDate}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))}
                />
              </div>

              <div className='sm:col-span-2'>
                <Label htmlFor={`${fieldPrefix}-timezone`} className='text-xs font-bold'>
                  Múi giờ vận hành
                </Label>
                <Input
                  id={`${fieldPrefix}-timezone`}
                  className='mt-2'
                  value={draft.timezone}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      timezone: event.target.value,
                    }))}
                />
              </div>

              <div className='sm:col-span-2'>
                <Label htmlFor={`${fieldPrefix}-north-star`} className='text-xs font-bold'>
                  North star
                </Label>
                <textarea
                  id={`${fieldPrefix}-north-star`}
                  rows={4}
                  value={draft.northStar}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      northStar: event.target.value,
                    }))}
                  className='mt-2 w-full resize-y rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
                />
              </div>

              <div className='sm:col-span-2'>
                <Label htmlFor={`${fieldPrefix}-objectives`} className='text-xs font-bold'>
                  Mục tiêu
                </Label>
                <textarea
                  id={`${fieldPrefix}-objectives`}
                  rows={6}
                  value={draft.objectives}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      objectives: event.target.value,
                    }))}
                  className='mt-2 w-full resize-y rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
                />
                <p className='mt-1.5 text-[11px] leading-4 text-foreground-muted'>
                  Mỗi dòng là một mục tiêu có thể rà soát độc lập.
                </p>
              </div>
            </div>

            <fieldset className='mt-6 rounded-2xl border border-slate-200 p-4'>
              <legend className='px-1 text-sm font-extrabold text-foreground'>
                Trạng thái ưu tiên
              </legend>
              <p className='mt-1 text-xs leading-5 text-foreground-muted'>
                Cập nhật tiến độ từng đầu việc; thay đổi sẽ được lưu cùng phiên bản chiến lược.
              </p>
              <div className='mt-4 space-y-3'>
                {strategy.priorities.map((priority) => {
                  const selectId = `${fieldPrefix}-${priority.id}-status`;
                  return (
                    <div
                      key={priority.id}
                      className='grid gap-3 rounded-xl bg-muted p-3 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-center'
                    >
                      <div className='min-w-0'>
                        <p className='text-xs font-extrabold text-foreground'>
                          {priority.rank}. {priority.title}
                        </p>
                        <p className='mt-1 text-[11px] leading-4 text-foreground-muted'>
                          {priority.owner} · hạn ngày {priority.dueDay}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor={selectId} className='sr-only'>
                          Trạng thái {priority.title}
                        </Label>
                        <select
                          id={selectId}
                          value={draft.priorityStatuses[priority.id] ?? priority.status}
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              priorityStatuses: {
                                ...current.priorityStatuses,
                                [priority.id]: event.target
                                  .value as StrategyPriority['status'],
                              },
                            }))}
                          className='h-10 w-full rounded-xl border border-slate-200 bg-card px-3 text-xs font-semibold text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
                        >
                          {PRIORITY_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </fieldset>

            <section
              className='mt-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4'
              aria-labelledby={`${fieldPrefix}-provenance-title`}
            >
              <div className='flex items-center gap-2 text-blue-900'>
                <FileText className='size-4' aria-hidden />
                <h3
                  id={`${fieldPrefix}-provenance-title`}
                  className='text-sm font-extrabold'
                >
                  Nguồn và lịch sử xác nhận
                </h3>
              </div>
              <ul className='mt-3 space-y-2'>
                {strategy.provenance.slice(-3).map((source) => (
                  <li key={source.id} className='text-xs leading-5 text-blue-900/80'>
                    <strong>{source.label}:</strong> {source.note}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <footer className='shrink-0 border-t border-slate-200 bg-card px-4 py-4 sm:px-6'>
            <div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <p className='flex items-start gap-2 text-[11px] leading-4 text-foreground-muted'>
                <ShieldCheck className='mt-0.5 size-3.5 shrink-0' aria-hidden />
                Xác nhận chỉ duyệt cấu hình kế hoạch; không tự lên lịch hoặc xuất bản.
              </p>
              <div className='flex flex-col-reverse gap-2 sm:flex-row'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={saveDraft}
                  disabled={!hasChanged}
                >
                  <Save className='size-4' aria-hidden />
                  Lưu bản chỉnh sửa
                </Button>
                <Button
                  type='submit'
                  disabled={!hasChanged && isAlreadyConfirmed}
                >
                  <CheckCircle2 className='size-4' aria-hidden />
                  {hasChanged ? 'Lưu và xác nhận' : 'Xác nhận kế hoạch'}
                </Button>
              </div>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
