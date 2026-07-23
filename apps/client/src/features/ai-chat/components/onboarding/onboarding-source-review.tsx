'use client';

import {
  Check,
  ExternalLink,
  Eye,
  Globe2,
  Link2,
  LockKeyhole,
  Network,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type {
  DiscoverySource,
  OnboardingConnectionChoice,
} from '@/features/ai-chat/types/onboarding-types';
import { cn } from '@/lib/utils';

type OnboardingSourceReviewProps = {
  sources: DiscoverySource[];
  summary: string | null;
  onConfirm: (choices: OnboardingConnectionChoice[]) => void;
  onSearchAgain: () => void;
};

function sourceIcon(kind: DiscoverySource['kind']) {
  return kind === 'website' ? Globe2 : Network;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function OnboardingSourceReview({
  sources,
  summary,
  onConfirm,
  onSearchAgain,
}: OnboardingSourceReviewProps) {
  const selectableSources = useMemo(
    () => sources.filter((source) => source.status === 'found_public'),
    [sources],
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(selectableSources.map((source) => source.id)),
  );
  const [manualUrl, setManualUrl] = useState('');
  const trimmedManualUrl = manualUrl.trim();
  const manualUrlValid = !trimmedManualUrl || isHttpUrl(trimmedManualUrl);
  const selectedCount = selectedIds.size + (trimmedManualUrl && manualUrlValid ? 1 : 0);

  function toggleSource(sourceId: string): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(sourceId)) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });
  }

  function confirmSources(): void {
    if (!manualUrlValid) return;

    const choices: OnboardingConnectionChoice[] = sources.map((source) => {
      const selected = selectedIds.has(source.id);
      return {
        sourceId: source.id,
        decision: selected ? 'public_read' : 'skip',
        permission: 'read_only',
        status: selected ? 'selected' : 'skipped',
        accountLabel: source.label,
        accountUrl: source.url,
        note: selected
          ? 'Đã chọn làm nguồn đọc công khai; chưa cấp quyền tài khoản.'
          : 'Không dùng trong lần khởi tạo này.',
      };
    });

    if (trimmedManualUrl) {
      choices.push({
        sourceId: 'source-user-provided',
        decision: 'manual',
        permission: 'read_only',
        status: 'selected',
        accountLabel: 'Nguồn do bạn cung cấp',
        accountUrl: trimmedManualUrl,
        note: 'Chờ kiểm tra nội dung ở bước khởi tạo.',
      });
    }

    onConfirm(choices);
  }

  return (
    <section
      className='overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-[0_18px_55px_rgba(15,23,42,0.08)]'
      aria-labelledby='source-review-title'
    >
      <div className='border-b border-slate-100 bg-[linear-gradient(110deg,#fffaf0,#ffffff)] px-4 py-4 sm:px-5'>
        <div className='flex items-start gap-3'>
          <span className='flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700'>
            <ShieldCheck className='size-5' aria-hidden />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700'>
              Đã tìm thấy nguồn
            </p>
            <h3
              id='source-review-title'
              className='mt-1 text-base font-extrabold text-foreground'
            >
              Chọn nguồn để tạo workspace
            </h3>
            <p className='mt-1 text-xs leading-5 text-foreground-muted sm:text-sm'>
              {summary
                ?? 'Bạn có thể bỏ chọn nguồn không liên quan trước khi tiếp tục.'}
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-3 p-4 sm:p-5'>
        <div className='grid gap-2 sm:grid-cols-2'>
          {sources.map((source) => {
            const Icon = sourceIcon(source.kind);
            const selected = selectedIds.has(source.id);
            const available = source.status === 'found_public';
            const statusCopy = source.status === 'found_public'
              ? 'Có thể đọc công khai'
              : source.status === 'connection_required'
              ? 'Cần cấp quyền tài khoản'
              : source.status === 'not_found'
              ? 'Không tìm thấy'
              : source.status === 'error'
              ? 'Không thể kiểm tra'
              : 'Đang kiểm tra';

            return (
              <div
                key={source.id}
                className={cn(
                  'relative rounded-2xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-amber-300 focus-within:ring-offset-1',
                  selected
                    ? 'border-amber-300 bg-amber-50/55'
                    : 'border-slate-200 bg-white',
                  !available && 'opacity-60',
                )}
              >
                <label
                  className={cn(
                    'flex min-h-11 items-start gap-3',
                    available ? 'cursor-pointer' : 'cursor-not-allowed',
                  )}
                >
                  <input
                    type='checkbox'
                    className='peer sr-only'
                    checked={selected}
                    disabled={!available}
                    onChange={() => toggleSource(source.id)}
                  />
                  <span
                    className={cn(
                      'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 peer-focus-visible:ring-offset-2',
                      selected
                        ? 'border-amber-300 bg-primary text-slate-950'
                        : 'border-slate-200 bg-slate-50 text-slate-500',
                    )}
                    aria-hidden
                  >
                    {selected
                      ? <Check className='size-4' strokeWidth={2.8} />
                      : <Icon className='size-4' />}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-sm font-bold text-foreground'>
                      {source.label}
                    </span>
                    <span
                      className={cn(
                        'mt-1 flex items-center gap-1.5 text-[11px] font-semibold',
                        source.status === 'found_public'
                          ? 'text-emerald-700'
                          : 'text-amber-800',
                      )}
                    >
                      {source.status === 'found_public'
                        ? <Eye className='size-3' aria-hidden />
                        : <LockKeyhole className='size-3' aria-hidden />}
                      {statusCopy}
                    </span>
                  </span>
                </label>
                <div className='mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2'>
                  <span className='flex items-center gap-1 text-[10px] text-slate-500'>
                    <LockKeyhole className='size-3' aria-hidden />
                    {source.status === 'found_public'
                      ? 'Không có quyền xuất bản'
                      : 'Chưa dùng trong workspace'}
                  </span>
                  {source.url
                    ? (
                      <a
                        href={source.url}
                        target='_blank'
                        rel='noreferrer'
                        className='flex min-h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-bold text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300'
                        aria-label={`Mở ${source.label}`}
                      >
                        Kiểm tra
                        <ExternalLink className='size-3' aria-hidden />
                      </a>
                    )
                    : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className='rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3'>
          <label
            htmlFor='onboarding-manual-source'
            className='flex items-center gap-2 text-xs font-bold text-foreground'
          >
            <Plus className='size-4 text-amber-700' aria-hidden />
            Thêm URL chưa được tìm thấy
          </label>
          <div className='mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-amber-300 focus-within:ring-2 focus-within:ring-amber-100'>
            <Link2 className='size-4 shrink-0 text-slate-400' aria-hidden />
            <input
              id='onboarding-manual-source'
              type='url'
              value={manualUrl}
              onChange={(event) => setManualUrl(event.target.value)}
              placeholder='https://facebook.com/thuong-hieu'
              aria-invalid={!manualUrlValid}
              aria-describedby={manualUrlValid ? undefined : 'onboarding-manual-source-error'}
              className='h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400'
            />
          </div>
          {!manualUrlValid
            ? (
              <p
                id='onboarding-manual-source-error'
                className='mt-1.5 text-[11px] font-semibold text-rose-600'
              >
                Hãy nhập URL bắt đầu bằng http:// hoặc https://.
              </p>
            )
            : null}
        </div>

        <div className='rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-xs leading-5 text-sky-900'>
          HIVE-K chỉ thêm các URL công khai vào nguồn đọc. Insights riêng tư và quyền đăng bài vẫn
          chưa được cấp ở bước này.
        </div>

        <div className='flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between'>
          <Button variant='ghost' onClick={onSearchAgain}>
            Tìm nguồn khác
          </Button>
          <Button
            onClick={confirmSources}
            disabled={selectedCount === 0 || !manualUrlValid}
          >
            Dùng {selectedCount} nguồn và tiếp tục
          </Button>
        </div>
      </div>
    </section>
  );
}
