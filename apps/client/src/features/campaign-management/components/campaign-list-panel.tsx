'use client';

import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  OBJECTIVE_LABELS,
  PLATFORM_LABELS,
} from '@/features/campaign-management/data/campaign-management-options';
import type { CampaignBrief, CampaignDetailTab } from '@/features/campaign-management/types';
import { cn } from '@/lib/utils';
import { BarChart3, Edit3, Send, Users } from 'lucide-react';
import Link from 'next/link';

type CampaignListPanelProps = {
  campaigns: CampaignBrief[];
  selectedCampaignId: string;
  participantCounts: Record<string, number>;
  className?: string;
  onSelectCampaign: (campaignId: string) => void;
  onCreateCampaign: () => void;
  onOpenTab: (tab: CampaignDetailTab) => void;
};

export function CampaignListPanel({
  campaigns,
  selectedCampaignId,
  participantCounts,
  className,
  onSelectCampaign,
  onCreateCampaign,
  onOpenTab,
}: CampaignListPanelProps) {
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col rounded-lg border border-primary-soft bg-card shadow-sm',
        className,
      )}
    >
      <div className='shrink-0 border-b border-primary-soft p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <p className='text-sm font-extrabold text-foreground'>Danh sách chiến dịch</p>
            <p className='mt-1 text-xs text-foreground-muted'>
              Tracking, content và người tham gia.
            </p>
          </div>
          <Button size='sm' onClick={onCreateCampaign}>
            + Mới
          </Button>
        </div>
      </div>

      <div className='min-h-0 flex-1 space-y-3 overflow-y-auto p-3'>
        {campaigns.map((campaign) => {
          const isActive = campaign.id === selectedCampaignId;
          const totalPosts = campaign.postingPlan.reduce(
            (total, day) => total + day.posts.length,
            0,
          );
          const scheduledPosts = campaign.postingPlan.reduce(
            (total, day) => total + day.posts.filter((post) => post.status === 'scheduled').length,
            0,
          );

          return (
            <article
              key={campaign.id}
              className={cn(
                'rounded-lg border bg-background-light p-4 transition-colors',
                isActive
                  ? 'border-primary bg-primary-soft/60'
                  : 'border-primary-soft hover:bg-muted',
              )}
            >
              <div className='grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_22rem_23rem] xl:items-center'>
                <button
                  type='button'
                  onClick={() => onSelectCampaign(campaign.id)}
                  className='min-w-0 text-left'
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-sm font-extrabold text-primary'>
                      {campaign.name.slice(0, 2)}
                    </div>
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <h3 className='truncate text-base font-extrabold text-foreground'>
                          {campaign.name}
                        </h3>
                        <Badge
                          variant={campaign.status === 'scheduled' ? 'success' : 'warning'}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className='mt-1 text-xs text-foreground-muted'>
                        {OBJECTIVE_LABELS[campaign.objective]} · {campaign.productName}
                      </p>
                      <p className='mt-2 line-clamp-2 text-xs leading-5 text-foreground-muted'>
                        {campaign.description}
                      </p>
                      <div className='mt-3 flex flex-wrap gap-1.5'>
                        {campaign.platforms.map((platform) => (
                          <span
                            key={platform}
                            className='rounded-full border border-primary-soft bg-card px-2 py-1 text-[11px] font-semibold text-foreground-muted'
                          >
                            {PLATFORM_LABELS[platform]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>

                <div className='grid grid-cols-3 gap-2 text-center'>
                  <div className='rounded-lg bg-card p-3'>
                    <p className='text-lg font-extrabold text-foreground'>{totalPosts}</p>
                    <p className='text-[11px] text-foreground-muted'>Bài</p>
                  </div>
                  <div className='rounded-lg bg-card p-3'>
                    <p className='text-lg font-extrabold text-blue-600'>
                      {scheduledPosts}
                    </p>
                    <p className='text-[11px] text-foreground-muted'>Đã lên</p>
                  </div>
                  <div className='rounded-lg bg-card p-3'>
                    <p className='text-lg font-extrabold text-amber-600'>
                      {participantCounts[campaign.id] ?? 0}
                    </p>
                    <p className='text-[11px] text-foreground-muted'>Người</p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-1 sm:grid-cols-4'>
                  <button
                    type='button'
                    onClick={() => {
                      onSelectCampaign(campaign.id);
                      onOpenTab('tracking');
                    }}
                    className='inline-flex items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-bold text-foreground-muted hover:bg-card hover:text-foreground'
                  >
                    <BarChart3 className='size-3.5' aria-hidden />
                    Tracking
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      onSelectCampaign(campaign.id);
                      onOpenTab('content');
                    }}
                    className='inline-flex items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-bold text-foreground-muted hover:bg-card hover:text-foreground'
                  >
                    <Edit3 className='size-3.5' aria-hidden />
                    Edit
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      onSelectCampaign(campaign.id);
                      onOpenTab('participants');
                    }}
                    className='inline-flex items-center justify-center gap-1 rounded-md px-2 py-2 text-[11px] font-bold text-foreground-muted hover:bg-card hover:text-foreground'
                  >
                    <Users className='size-3.5' aria-hidden />
                    Participant
                  </button>
                  <Link
                    href={`/campaign-planning?campaignId=${campaign.id}`}
                    className={cn(
                      buttonVariants({ size: 'sm' }),
                      'h-auto min-h-9 px-2 text-[11px]',
                    )}
                  >
                    <Send className='size-3.5' aria-hidden />
                    Đăng bài tự động
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
