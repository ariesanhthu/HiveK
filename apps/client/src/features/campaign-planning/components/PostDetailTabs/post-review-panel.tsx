'use client';

import { type CampaignPost } from '@/features/campaign-planning/types/campaign-planning';
import { cn } from '@/lib/utils';
import { CheckCircle2, MessageSquareText, ShieldCheck, TriangleAlert } from 'lucide-react';

type PostReviewPanelProps = {
  post: CampaignPost;
  onPostChange: (patch: Partial<CampaignPost>) => void;
  onApprovePost: () => void;
};

const REVIEW_CHECKS = [
  {
    id: 'brand',
    label: 'Giọng văn thương hiệu',
    value: 'Đúng tinh thần trẻ, rõ lợi ích và không quá quảng cáo.',
    score: 92,
  },
  {
    id: 'cta',
    label: 'CTA',
    value: 'Có lời kêu gọi hành động, nên đặt ở câu cuối để dễ scan hơn.',
    score: 78,
  },
  {
    id: 'risk',
    label: 'Rủi ro nội dung',
    value: 'Không phát hiện claims nhạy cảm hoặc thông tin cần chứng minh.',
    score: 96,
  },
];

export function PostReviewPanel({
  post,
  onPostChange,
  onApprovePost,
}: PostReviewPanelProps) {
  return (
    <div className='mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1fr_18rem]'>
      <section className='space-y-4'>
        <div>
          <h3 className='text-sm font-extrabold text-foreground'>Checklist review</h3>
          <p className='mt-1 text-xs leading-5 text-foreground-muted'>
            Kiểm tra nhanh nội dung trước khi duyệt và chuyển sang lịch đăng.
          </p>
        </div>

        <div className='grid gap-3'>
          {REVIEW_CHECKS.map((check) => {
            const isWarning = check.score < 80;

            return (
              <div
                key={check.id}
                className='rounded-lg border border-primary-soft bg-card p-4 shadow-sm'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex min-w-0 gap-3'>
                    <span
                      className={cn(
                        'mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg',
                        isWarning ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600',
                      )}
                    >
                      {isWarning
                        ? <TriangleAlert className='size-4' aria-hidden />
                        : <ShieldCheck className='size-4' aria-hidden />}
                    </span>
                    <div>
                      <p className='text-sm font-bold text-foreground'>{check.label}</p>
                      <p className='mt-1 text-xs leading-5 text-foreground-muted'>
                        {check.value}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-bold',
                      isWarning ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
                    )}
                  >
                    {check.score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className='mb-2 flex items-center gap-2 text-xs font-bold text-foreground'>
            <MessageSquareText className='size-4' aria-hidden />
            Ghi chú review
          </label>
          <textarea
            value={post.reviewNote}
            onChange={(event) => onPostChange({ reviewNote: event.target.value })}
            className='h-28 w-full resize-none rounded-lg border border-primary-soft bg-card p-3 text-sm leading-6 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
            placeholder='Nhập ghi chú cho team content...'
          />
        </div>
      </section>

      <aside className='space-y-3 rounded-lg border border-primary-soft bg-background-light p-4'>
        <div>
          <p className='text-xs font-bold uppercase tracking-wide text-foreground-muted'>
            Người review
          </p>
          <input
            value={post.reviewer}
            onChange={(event) => onPostChange({ reviewer: event.target.value })}
            className='mt-2 h-10 w-full rounded-lg border border-primary-soft bg-card px-3 text-sm font-semibold text-foreground outline-none focus:border-primary'
          />
        </div>

        <div className='rounded-lg bg-card p-3'>
          <p className='text-xs font-bold text-foreground'>Trạng thái hiện tại</p>
          <p className='mt-1 text-sm font-semibold text-primary'>
            {post.status === 'approved'
              ? 'Đã duyệt'
              : post.status === 'scheduled'
              ? 'Đã lên lịch'
              : post.status === 'needs-review'
              ? 'Cần xem lại'
              : 'Bản nháp'}
          </p>
        </div>

        <button
          type='button'
          onClick={onApprovePost}
          className='inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark shadow-primary transition-colors hover:bg-amber-500'
        >
          <CheckCircle2 className='size-4' aria-hidden />
          Duyệt bài viết
        </button>
      </aside>
    </div>
  );
}
