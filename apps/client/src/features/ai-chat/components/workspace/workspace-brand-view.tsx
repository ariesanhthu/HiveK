'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkspaceSectionHeading } from '@/features/ai-chat/components/workspace/workspace-section-heading';
import type {
  BrandFact,
  BrandFactCategory,
  BrandProfile,
} from '@/features/ai-chat/types/workspace-types';
import { cn } from '@/lib/utils';
import {
  Check,
  ExternalLink,
  FileSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

type WorkspaceBrandViewProps = {
  workspaceName: string;
  brand: BrandProfile;
  onEditFact: (factId: string) => void;
  onConfirmFact: (factId: string) => void;
};

type CategoryFilter = 'all' | BrandFactCategory;
type StatusFilter = 'all' | BrandFact['status'];

const CATEGORY_LABELS: Record<BrandFactCategory, string> = {
  identity: 'Nhận diện',
  contact: 'Liên hệ',
  positioning: 'Định vị',
  service: 'Dịch vụ',
  audience: 'Khách hàng',
  proof: 'Bằng chứng',
  voice: 'Giọng văn',
};

const CATEGORY_ORDER: readonly BrandFactCategory[] = [
  'identity',
  'positioning',
  'service',
  'audience',
  'proof',
  'voice',
  'contact',
];

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function qualityLabel(fact: BrandFact): string {
  if (fact.dataQuality === 'verified') return 'Đã đối chiếu';
  if (fact.dataQuality === 'user_provided') return 'Bạn cung cấp';
  return 'Ước tính';
}

export function WorkspaceBrandView({
  workspaceName,
  brand,
  onEditFact,
  onConfirmFact,
}: WorkspaceBrandViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const searchFromUrl = searchParams.get('q') ?? '';
  const categoryFromUrl = searchParams.get('category');
  const statusFromUrl = searchParams.get('status');
  const category: CategoryFilter = CATEGORY_ORDER.includes(
      categoryFromUrl as BrandFactCategory,
    )
    ? (categoryFromUrl as BrandFactCategory)
    : 'all';
  const status: StatusFilter = statusFromUrl === 'confirmed' || statusFromUrl === 'needs_review'
    ? statusFromUrl
    : 'all';
  const [search, setSearch] = useState(searchFromUrl);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => setSearch(searchFromUrl), [searchFromUrl]);

  useEffect(() => {
    if (search === searchFromUrl) return;
    const timeoutId = window.setTimeout(() => {
      const next = new URLSearchParams(searchParamsKey);
      if (search.trim()) next.set('q', search.trim());
      else next.delete('q');
      router.replace(`/ai-chat?${next.toString()}`, { scroll: false });
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [router, search, searchFromUrl, searchParamsKey]);

  function updateFilter(
    key: 'category' | 'status',
    value: CategoryFilter | StatusFilter,
  ): void {
    const next = new URLSearchParams(searchParamsKey);
    if (value === 'all') next.delete(key);
    else next.set(key, value);
    router.replace(`/ai-chat?${next.toString()}`, { scroll: false });
  }

  const filteredFacts = useMemo(() => {
    const query = normalizeSearch(deferredSearch);
    return brand.facts.filter((fact) => {
      if (category !== 'all' && fact.category !== category) return false;
      if (status !== 'all' && fact.status !== status) return false;
      if (!query) return true;
      return normalizeSearch(`${fact.label} ${fact.value}`).includes(query);
    });
  }, [brand.facts, category, deferredSearch, status]);

  const groupedFacts = useMemo(
    () =>
      CATEGORY_ORDER.map((categoryId) => ({
        id: categoryId,
        facts: filteredFacts.filter((fact) => fact.category === categoryId),
      })).filter((group) => group.facts.length > 0),
    [filteredFacts],
  );
  const pendingCount = brand.facts.filter((fact) => fact.status === 'needs_review').length;
  const categoryCount = new Set(brand.facts.map((fact) => fact.category)).size;

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8'>
      <WorkspaceSectionHeading
        eyebrow='Brand snapshot'
        title='Hồ sơ thương hiệu đã được điền sẵn'
        description={`Kiểm tra những gì HiveK đã hiểu về ${workspaceName}. Mỗi trường đều có trạng thái, độ tin cậy, ngày quan sát và nguồn để bạn sửa hoặc xác nhận.`}
        action={pendingCount > 0
          ? (
            <Button onClick={() => updateFilter('status', 'needs_review')}>
              <FileSearch className='size-4' aria-hidden />
              Duyệt {pendingCount} mục còn lại
            </Button>
          )
          : (
            <Badge variant='success'>
              <ShieldCheck className='mr-1 size-3.5' aria-hidden />
              Hồ sơ đã xác nhận
            </Badge>
          )}
      />

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4' aria-label='Tóm tắt hồ sơ'>
        <div className='rounded-2xl border border-slate-200 bg-card p-4'>
          <p className='text-[11px] font-bold uppercase tracking-wide text-foreground-muted'>
            Dữ kiện đã tìm thấy
          </p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>{brand.facts.length}</p>
          <p className='mt-1 text-xs text-foreground-muted'>thuộc {categoryCount} nhóm</p>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-card p-4'>
          <p className='text-[11px] font-bold uppercase tracking-wide text-foreground-muted'>
            Đã xác nhận
          </p>
          <p className='mt-2 text-2xl font-extrabold text-emerald-700'>
            {brand.readiness.allFacts.confirmed}/{brand.readiness.allFacts.total}
          </p>
          <p className='mt-1 text-xs text-foreground-muted'>có thể dùng trong nội dung</p>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-card p-4'>
          <p className='text-[11px] font-bold uppercase tracking-wide text-foreground-muted'>
            Dữ kiện bắt buộc
          </p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>
            {brand.readiness.requiredFacts.confirmed}/{brand.readiness.requiredFacts.total}
          </p>
          <p className='mt-1 text-xs text-foreground-muted'>đủ để lập kế hoạch</p>
        </div>
        <div className='rounded-2xl border border-amber-200 bg-amber-50/70 p-4'>
          <p className='text-[11px] font-bold uppercase tracking-wide text-amber-700'>
            Mức sẵn sàng
          </p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>{brand.readiness.score}%</p>
          <p className='mt-1 text-xs text-foreground-muted'>{brand.readiness.summary}</p>
        </div>
      </section>

      <section
        className='sticky top-0 z-10 rounded-2xl border border-slate-200 bg-card/95 p-3 shadow-sm backdrop-blur sm:p-4'
        aria-label='Bộ lọc dữ kiện'
      >
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center'>
          <div className='relative min-w-0 flex-1'>
            <label htmlFor='brand-fact-search' className='sr-only'>
              Tìm dữ kiện thương hiệu
            </label>
            <Search
              className='pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400'
              aria-hidden
            />
            <Input
              id='brand-fact-search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Tìm tên trường hoặc giá trị…'
              className='pl-10'
            />
          </div>
          <div className='flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-1 lg:pb-0'>
            <SlidersHorizontal className='size-4 shrink-0 text-slate-400' aria-hidden />
            {(['all', 'needs_review', 'confirmed'] as const).map((filter) => (
              <button
                key={filter}
                type='button'
                onClick={() => updateFilter('status', filter)}
                aria-pressed={status === filter}
                className={cn(
                  'h-9 shrink-0 rounded-xl border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  status === filter
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-slate-200 text-foreground-muted hover:bg-muted',
                )}
              >
                {filter === 'all'
                  ? 'Tất cả'
                  : filter === 'needs_review'
                  ? 'Cần xác nhận'
                  : 'Đã xác nhận'}
              </button>
            ))}
          </div>
        </div>
        <div className='mt-3 flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1'>
          <button
            type='button'
            onClick={() => updateFilter('category', 'all')}
            aria-pressed={category === 'all'}
            className={cn(
              'h-8 shrink-0 rounded-lg px-2.5 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              category === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-foreground-muted hover:text-foreground',
            )}
          >
            Mọi nhóm
          </button>
          {CATEGORY_ORDER.map((categoryId) => (
            <button
              key={categoryId}
              type='button'
              onClick={() => updateFilter('category', categoryId)}
              aria-pressed={category === categoryId}
              className={cn(
                'h-8 shrink-0 rounded-lg px-2.5 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                category === categoryId
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-foreground-muted hover:text-foreground',
              )}
            >
              {CATEGORY_LABELS[categoryId]}
            </button>
          ))}
        </div>
      </section>

      {groupedFacts.length > 0
        ? (
          <div className='space-y-6'>
            {groupedFacts.map((group) => (
              <section key={group.id} aria-labelledby={`fact-group-${group.id}`}>
                <div className='mb-3 flex items-center justify-between gap-3'>
                  <h2
                    id={`fact-group-${group.id}`}
                    className='text-base font-extrabold text-foreground'
                  >
                    {CATEGORY_LABELS[group.id]}
                  </h2>
                  <span className='text-xs font-semibold text-foreground-muted'>
                    {group.facts.length} trường
                  </span>
                </div>
                <div className='grid gap-3 lg:grid-cols-2'>
                  {group.facts.map((fact) => {
                    const primarySource = fact.provenance[0];
                    return (
                      <article
                        key={fact.id}
                        className='[content-visibility:auto] [contain-intrinsic-size:0_14rem] rounded-2xl border border-slate-200 bg-card p-4 shadow-sm'
                      >
                        <div className='flex items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <div className='flex flex-wrap items-center gap-2'>
                              <h3 className='text-xs font-extrabold uppercase tracking-wide text-foreground-muted'>
                                {fact.label}
                              </h3>
                              {fact.isRequired
                                ? (
                                  <span className='text-[10px] font-bold text-red-600'>
                                    Bắt buộc
                                  </span>
                                )
                                : null}
                            </div>
                            <p className='mt-2 whitespace-pre-wrap text-sm font-semibold leading-6 text-foreground'>
                              {fact.value}
                            </p>
                          </div>
                          <Badge variant={fact.status === 'confirmed' ? 'success' : 'warning'}>
                            {fact.status === 'confirmed' ? 'Đã duyệt' : 'Cần duyệt'}
                          </Badge>
                        </div>

                        <div className='mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-foreground-muted'>
                          <span>{qualityLabel(fact)}</span>
                          <span aria-hidden>·</span>
                          <span>Độ tin cậy {Math.round(fact.confidence * 100)}%</span>
                          {primarySource
                            ? (
                              <>
                                <span aria-hidden>·</span>
                                <span className='max-w-48 truncate'>
                                  Nguồn: {primarySource.label}
                                </span>
                              </>
                            )
                            : null}
                        </div>

                        <div className='mt-3 flex flex-wrap gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => onEditFact(fact.id)}
                          >
                            Sửa hoặc xem nguồn
                          </Button>
                          {fact.status === 'needs_review'
                            ? (
                              <Button
                                size='sm'
                                onClick={() => onConfirmFact(fact.id)}
                              >
                                <Check className='size-3.5' aria-hidden />
                                Xác nhận
                              </Button>
                            )
                            : null}
                          {primarySource?.url
                            ? (
                              <a
                                href={primarySource.url}
                                target='_blank'
                                rel='noreferrer'
                                className='ml-auto flex size-9 items-center justify-center rounded-lg text-foreground-muted hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                                aria-label={`Mở nguồn ${primarySource.label}`}
                              >
                                <ExternalLink className='size-3.5' aria-hidden />
                              </a>
                            )
                            : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )
        : (
          <section className='rounded-2xl border border-slate-200 bg-card px-5 py-10 text-center'>
            <FileSearch className='mx-auto size-7 text-slate-400' aria-hidden />
            <h2 className='mt-3 text-base font-extrabold text-foreground'>
              Không có dữ kiện phù hợp
            </h2>
            <p className='mt-1 text-sm text-foreground-muted'>
              Hãy xóa từ khóa hoặc thay đổi bộ lọc.
            </p>
            <Button
              variant='outline'
              className='mt-4'
              onClick={() => {
                setSearch('');
                const next = new URLSearchParams(searchParamsKey);
                next.delete('q');
                next.delete('category');
                next.delete('status');
                router.replace(`/ai-chat?${next.toString()}`, { scroll: false });
              }}
            >
              Xóa bộ lọc
            </Button>
          </section>
        )}
    </div>
  );
}
