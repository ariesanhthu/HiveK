'use client';

import { Badge } from '@/components/ui/badge';
import { PLATFORM_LABELS } from '@/features/campaign-management/data/campaign-management-options';
import type { CampaignPostingDay, CampaignPostNode } from '@/features/campaign-management/types';

type PostingRoadmapProps = {
  postingPlan: CampaignPostingDay[];
  compact?: boolean;
};

const STATUS_LABELS: Record<CampaignPostNode['status'], string> = {
  draft: 'Nháp',
  'needs-review': 'Cần duyệt',
  approved: 'Đã duyệt',
  scheduled: 'Đã lên lịch',
};

function statusVariant(status: CampaignPostNode['status']) {
  if (status === 'approved' || status === 'scheduled') return 'success';
  if (status === 'needs-review') return 'warning';
  return 'secondary';
}

export function PostingRoadmap({ postingPlan, compact = false }: PostingRoadmapProps) {
  return (
    <div className='space-y-3'>
      {postingPlan.map((day) => (
        <section
          key={day.day}
          className='rounded-lg border border-primary-soft bg-background-light p-3'
        >
          <div className='flex items-center justify-between gap-3'>
            <div>
              <p className='text-xs font-extrabold text-foreground'>Ngày {day.day}</p>
              <p className='mt-0.5 text-xs text-foreground-muted'>{day.dateLabel}</p>
            </div>
            <Badge variant='secondary'>{day.posts.length} bài</Badge>
          </div>

          <div className='mt-3 space-y-2'>
            {day.posts.map((post) => (
              <article
                key={post.id}
                className='rounded-lg border border-primary-soft bg-card p-3'
              >
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <p className='truncate text-xs font-extrabold text-foreground'>
                      {post.time} · {post.title}
                    </p>
                    <p className='mt-1 text-xs text-foreground-muted'>
                      {PLATFORM_LABELS[post.platform]} · {post.contentType} · {post.owner}
                    </p>
                  </div>
                  <Badge variant={statusVariant(post.status)}>
                    {STATUS_LABELS[post.status]}
                  </Badge>
                </div>
                {compact ? null : (
                  <p className='mt-2 text-xs leading-5 text-foreground-muted'>
                    {post.angle}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
