'use client';

import { Badge } from '@/components/ui/badge';
import type { CampaignBrief } from '@/features/campaign-management/types';

type CampaignTrackingDashboardProps = {
  campaign: CampaignBrief;
  participantCount: number;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

export function CampaignTrackingDashboard({
  campaign,
  participantCount,
}: CampaignTrackingDashboardProps) {
  const totalPosts = campaign.postingPlan.reduce(
    (total, day) => total + day.posts.length,
    0,
  );
  const scheduledPosts = campaign.postingPlan.reduce(
    (total, day) => total + day.posts.filter((post) => post.status === 'scheduled').length,
    0,
  );
  const approvedPosts = campaign.postingPlan.reduce(
    (total, day) => total + day.posts.filter((post) => post.status === 'approved').length,
    0,
  );
  const roi = campaign.tracking.spend > 0
    ? ((campaign.tracking.revenue - campaign.tracking.spend)
      / campaign.tracking.spend)
      * 100
    : 0;

  const kpis = [
    {
      label: 'Impressions',
      value: formatNumber(campaign.tracking.impressions),
      detail: 'Lượt hiển thị toàn chiến dịch',
    },
    {
      label: 'Reach',
      value: formatNumber(campaign.tracking.reach),
      detail: 'Người dùng tiếp cận',
    },
    {
      label: 'Engagement',
      value: `${campaign.tracking.engagementRate}%`,
      detail: `${formatNumber(campaign.tracking.comments)} comment`,
    },
    {
      label: 'Clicks',
      value: formatNumber(campaign.tracking.clicks),
      detail: `${formatNumber(campaign.tracking.leads)} lead`,
    },
    {
      label: 'Conversion',
      value: `${campaign.tracking.conversionRate}%`,
      detail: 'Từ click sang lead/đơn',
    },
    {
      label: 'ROI',
      value: `${roi.toFixed(1)}%`,
      detail: `${formatCurrency(campaign.tracking.revenue)} revenue`,
    },
  ];

  return (
    <div className='mx-auto max-w-6xl space-y-4'>
      <section className='rounded-lg border border-primary-soft bg-background-light p-4'>
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <p className='text-sm font-extrabold text-foreground'>
              Tracking KPI chiến dịch
            </p>
            <p className='mt-1 text-xs text-foreground-muted'>
              Dashboard tổng quan hiệu quả, chi phí, chuyển đổi và trạng thái vận hành.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='warning'>{campaign.status}</Badge>
            <Badge variant='secondary'>{participantCount} người tham gia</Badge>
            <Badge variant='secondary'>{totalPosts} bài viết</Badge>
          </div>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6'>
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className='rounded-lg border border-primary-soft bg-card p-3'
            >
              <p className='text-[11px] font-bold uppercase tracking-wide text-foreground-muted'>
                {kpi.label}
              </p>
              <p className='mt-2 text-xl font-extrabold text-foreground'>{kpi.value}</p>
              <p className='mt-1 text-xs text-foreground-muted'>{kpi.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className='grid gap-4 lg:grid-cols-[1fr_1fr]'>
        <section className='rounded-lg border border-primary-soft bg-card p-4'>
          <p className='text-sm font-extrabold text-foreground'>Tình trạng bài đăng</p>
          <div className='mt-4 grid grid-cols-3 gap-3'>
            <div className='rounded-lg bg-background-light p-3 text-center'>
              <p className='text-xl font-extrabold text-foreground'>{totalPosts}</p>
              <p className='text-xs text-foreground-muted'>Tổng bài</p>
            </div>
            <div className='rounded-lg bg-background-light p-3 text-center'>
              <p className='text-xl font-extrabold text-emerald-600'>{approvedPosts}</p>
              <p className='text-xs text-foreground-muted'>Đã duyệt</p>
            </div>
            <div className='rounded-lg bg-background-light p-3 text-center'>
              <p className='text-xl font-extrabold text-blue-600'>{scheduledPosts}</p>
              <p className='text-xs text-foreground-muted'>Đã lên lịch</p>
            </div>
          </div>
          <div className='mt-4 h-2 overflow-hidden rounded-full bg-muted'>
            <div
              className='h-full rounded-full bg-primary'
              style={{ width: `${Math.min(100, (scheduledPosts / totalPosts) * 100)}%` }}
            />
          </div>
        </section>

        <section className='rounded-lg border border-primary-soft bg-card p-4'>
          <p className='text-sm font-extrabold text-foreground'>Chi phí & doanh thu</p>
          <div className='mt-4 space-y-3'>
            <div className='flex items-center justify-between rounded-lg bg-background-light p-3'>
              <span className='text-sm font-semibold text-foreground-muted'>Spend</span>
              <span className='text-sm font-extrabold text-foreground'>
                {formatCurrency(campaign.tracking.spend)}
              </span>
            </div>
            <div className='flex items-center justify-between rounded-lg bg-background-light p-3'>
              <span className='text-sm font-semibold text-foreground-muted'>Revenue</span>
              <span className='text-sm font-extrabold text-emerald-600'>
                {formatCurrency(campaign.tracking.revenue)}
              </span>
            </div>
            <div className='flex items-center justify-between rounded-lg bg-primary-soft p-3'>
              <span className='text-sm font-semibold text-foreground'>ROI</span>
              <span className='text-sm font-extrabold text-primary'>
                {roi.toFixed(1)}%
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
