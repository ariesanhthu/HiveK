'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkspaceSectionHeading } from '@/features/ai-chat/components/workspace/workspace-section-heading';
import type {
  ChannelConnectionStatus,
  ChannelProfile,
  SatelliteRecommendation,
  SocialPlatform,
  WorkspaceViewId,
} from '@/features/ai-chat/types/workspace-types';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  AtSign,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Globe2,
  type LucideIcon,
  MessageCircle,
  Music2,
  Orbit,
  PencilLine,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type WorkspaceChannelsViewProps = {
  workspaceName: string;
  mode: 'channels' | 'satellites';
  channels: ChannelProfile[];
  satellites: SatelliteRecommendation[];
  onNavigate: (view: WorkspaceViewId) => void;
  onOpenChannel: (channelId: string) => void;
  onOpenSatellite: (satelliteId: string) => void;
  onConfirmChannel: (channelId: string) => void;
  onConfirmSatellite: (satelliteId: string) => void;
};

const PLATFORM_META: Record<
  SocialPlatform,
  { label: string; icon: LucideIcon; className: string; }
> = {
  website: { label: 'Website', icon: Globe2, className: 'bg-slate-100 text-slate-700' },
  facebook: { label: 'Facebook', icon: MessageCircle, className: 'bg-blue-50 text-blue-700' },
  tiktok: { label: 'TikTok', icon: Music2, className: 'bg-slate-900 text-white' },
  youtube: { label: 'YouTube', icon: Play, className: 'bg-red-50 text-red-700' },
  linkedin: { label: 'LinkedIn', icon: BriefcaseBusiness, className: 'bg-sky-50 text-sky-700' },
  x: { label: 'X', icon: AtSign, className: 'bg-slate-100 text-slate-900' },
};

const CONNECTION_LABELS: Record<ChannelConnectionStatus, string> = {
  public_only: 'Nguồn công khai',
  connected: 'Đã kết nối',
  needs_reconnect: 'Cần kết nối lại',
  planned: 'Đang lên kế hoạch',
};

function statusVariant(
  status: ChannelConnectionStatus,
): 'success' | 'warning' | 'secondary' {
  if (status === 'connected') return 'success';
  if (status === 'needs_reconnect') return 'warning';
  return 'secondary';
}

function ChannelsPanel({
  workspaceName,
  channels,
  satellites,
  onNavigate,
  onOpenChannel,
  onConfirmChannel,
}: Omit<WorkspaceChannelsViewProps, 'mode' | 'onOpenSatellite' | 'onConfirmSatellite'>) {
  const confirmed = channels.filter((channel) => channel.status === 'confirmed').length;
  const publishable = channels.filter((channel) => channel.canPublish).length;
  const needsReview = channels.find((channel) => channel.status === 'needs_review');

  return (
    <>
      <WorkspaceSectionHeading
        eyebrow='Channel portfolio'
        title={`Fanpage và kênh ${workspaceName}`}
        description='Mỗi kênh có hồ sơ riêng về vai trò, đối tượng, trụ cột, nhịp đăng, quyền đọc và quyền xuất bản. Chỉ số chưa có kết nối chính thức luôn được gắn nhãn ước tính.'
        action={
          <Button
            onClick={() => needsReview ? onOpenChannel(needsReview.id) : onNavigate('satellites')}
          >
            {needsReview ? 'Duyệt kênh tiếp theo' : 'Xem kênh vệ tinh'}
            <ArrowRight className='size-4' aria-hidden />
          </Button>
        }
      />

      <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <div className='rounded-2xl border border-slate-200 bg-card p-4'>
          <p className='text-[11px] font-bold uppercase tracking-wide text-foreground-muted'>
            Kênh đã lập hồ sơ
          </p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>{channels.length}</p>
          <p className='mt-1 text-xs text-foreground-muted'>website và social profile</p>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-card p-4'>
          <p className='text-[11px] font-bold uppercase tracking-wide text-foreground-muted'>
            Đã xác nhận
          </p>
          <p className='mt-2 text-2xl font-extrabold text-emerald-700'>
            {confirmed}/{channels.length}
          </p>
          <p className='mt-1 text-xs text-foreground-muted'>hồ sơ sẵn sàng dùng</p>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-card p-4'>
          <p className='text-[11px] font-bold uppercase tracking-wide text-foreground-muted'>
            Có quyền xuất bản
          </p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>{publishable}</p>
          <p className='mt-1 text-xs text-foreground-muted'>vẫn yêu cầu duyệt trước đăng</p>
        </div>
        <button
          type='button'
          onClick={() => onNavigate('satellites')}
          className='rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-left hover:border-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300'
        >
          <p className='text-[11px] font-bold uppercase tracking-wide text-violet-700'>
            Hồ sơ vệ tinh
          </p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>{satellites.length}</p>
          <p className='mt-1 flex items-center gap-1 text-xs font-bold text-violet-700'>
            Xem đề xuất <ArrowRight className='size-3.5' aria-hidden />
          </p>
        </button>
      </div>

      <div className='grid gap-4 lg:grid-cols-2 2xl:grid-cols-3'>
        {channels.map((channel) => {
          const meta = PLATFORM_META[channel.platform];
          const Icon = meta.icon;
          return (
            <article
              key={channel.id}
              className='[content-visibility:auto] [contain-intrinsic-size:0_25rem] overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm'
            >
              <div className='flex items-start gap-3 p-4 sm:p-5'>
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                    meta.className,
                  )}
                >
                  <Icon className='size-5' aria-hidden />
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <h2 className='truncate text-sm font-extrabold text-foreground'>
                        {channel.displayName}
                      </h2>
                      <p className='mt-0.5 truncate text-xs text-foreground-muted'>
                        {channel.handle}
                      </p>
                    </div>
                    <a
                      href={channel.url}
                      target='_blank'
                      rel='noreferrer'
                      className='flex size-9 shrink-0 items-center justify-center rounded-xl text-foreground-muted hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
                      aria-label={`Mở ${channel.displayName}`}
                    >
                      <ExternalLink className='size-4' aria-hidden />
                    </a>
                  </div>
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    <Badge variant={statusVariant(channel.connectionStatus)}>
                      {CONNECTION_LABELS[channel.connectionStatus]}
                    </Badge>
                    <Badge variant={channel.status === 'confirmed' ? 'success' : 'warning'}>
                      {channel.status === 'confirmed' ? 'Đã duyệt' : 'Cần duyệt'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-px border-y border-slate-100 bg-slate-100'>
                {(channel.metrics.length > 0
                  ? channel.metrics.slice(0, 2)
                  : [
                    {
                      id: 'coverage',
                      label: 'Độ phủ dữ liệu',
                      formattedValue: 'Chưa đủ',
                      dataQuality: channel.dataQuality,
                    },
                    {
                      id: 'posts',
                      label: 'Nội dung',
                      formattedValue: 'Đang đồng bộ',
                      dataQuality: channel.dataQuality,
                    },
                  ]).map((metric) => (
                    <div key={metric.id} className='bg-card px-4 py-3'>
                      <p className='text-[10px] font-bold uppercase tracking-wide text-foreground-muted'>
                        {metric.label}
                      </p>
                      <p className='mt-1 text-lg font-extrabold text-foreground'>
                        {metric.formattedValue}
                      </p>
                      <p className='mt-1 text-[10px] text-foreground-muted'>
                        {metric.dataQuality === 'estimated'
                          ? 'Ước tính'
                          : metric.dataQuality === 'verified'
                          ? 'Đã đối chiếu'
                          : 'Bạn cung cấp'}
                      </p>
                    </div>
                  ))}
              </div>

              <div className='space-y-3 p-4 sm:p-5'>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wide text-foreground-muted'>
                    Vai trò kênh
                  </p>
                  <p className='mt-1 text-xs font-semibold leading-5 text-foreground'>
                    {channel.role}
                  </p>
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wide text-foreground-muted'>
                    Trụ cột ưu tiên
                  </p>
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {channel.contentPillars.slice(0, 3).map((pillar) => (
                      <span
                        key={pillar}
                        className='rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-foreground-muted'
                      >
                        {pillar}
                      </span>
                    ))}
                  </div>
                </div>
                <div className='flex flex-wrap items-center gap-2 text-[11px] text-foreground-muted'>
                  <span className='inline-flex items-center gap-1'>
                    <ShieldCheck className='size-3.5 text-emerald-600' aria-hidden /> Đọc:{' '}
                    {channel.canRead ? 'Có' : 'Chưa'}
                  </span>
                  <span aria-hidden>·</span>
                  <span>Xuất bản: {channel.canPublish ? 'Có duyệt' : 'Chưa cấp'}</span>
                  <span aria-hidden>·</span>
                  <span>{channel.cadence}</span>
                </div>
                <div className='flex gap-2 border-t border-slate-100 pt-3'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='flex-1'
                    onClick={() => onOpenChannel(channel.id)}
                  >
                    <PencilLine className='size-3.5' aria-hidden />
                    Xem và chỉnh
                  </Button>
                  {channel.status === 'needs_review'
                    ? (
                      <Button
                        size='sm'
                        onClick={() => onConfirmChannel(channel.id)}
                        aria-label={`Xác nhận ${channel.displayName}`}
                      >
                        <CheckCircle2 className='size-3.5' aria-hidden />
                        Xác nhận
                      </Button>
                    )
                    : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function SatellitesPanel({
  channels,
  satellites,
  onNavigate,
  onOpenSatellite,
  onConfirmSatellite,
}: Omit<WorkspaceChannelsViewProps, 'mode' | 'onOpenChannel' | 'onConfirmChannel'>) {
  const visibleSatellites = satellites.filter(
    (item) => item.status !== 'dismissed',
  );
  const accepted =
    visibleSatellites.filter((item) => item.status === 'accepted' || item.status === 'active')
      .length;
  const highPriority = visibleSatellites.filter((item) => item.priority === 'high').length;
  const firstSuggested = visibleSatellites.find((item) => item.status === 'suggested');

  return (
    <>
      <WorkspaceSectionHeading
        eyebrow='Satellite builder'
        title='Hồ sơ kênh vệ tinh được gợi ý sẵn'
        description='HiveK tìm khoảng trống về đối tượng, mục tiêu và định dạng rồi điền bio, handle, vai trò, nội dung, CTA và guardrail. Bạn chỉnh sửa và xác nhận trước khi kết nối hoặc tạo kênh thật.'
        action={firstSuggested
          ? (
            <Button onClick={() => onOpenSatellite(firstSuggested.id)}>
              <Sparkles className='size-4' aria-hidden />
              Duyệt đề xuất ưu tiên
            </Button>
          )
          : (
            <Button variant='outline' onClick={() => onNavigate('strategy')}>
              Đưa vào chiến lược <ArrowRight className='size-4' aria-hidden />
            </Button>
          )}
      />

      <section
        className='rounded-2xl border border-violet-200 bg-[linear-gradient(120deg,#f5f3ff,#ffffff)] p-4 sm:p-5'
        aria-labelledby='satellite-summary-title'
      >
        <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <div className='flex items-center gap-2'>
              <Orbit className='size-5 text-violet-700' aria-hidden />
              <h2 id='satellite-summary-title' className='text-base font-extrabold text-foreground'>
                Phân tích khoảng trống kênh
              </h2>
            </div>
            <p className='mt-2 max-w-2xl text-xs leading-5 text-foreground-muted'>
              So sánh {channels.length}{' '}
              kênh hiện có với đối tượng, phễu nội dung và định dạng trong chiến lược 90 ngày.
            </p>
          </div>
          <div className='grid grid-cols-3 gap-2 text-center'>
            <div className='rounded-xl bg-white px-3 py-2'>
              <p className='text-lg font-extrabold text-foreground'>{visibleSatellites.length}</p>
              <p className='text-[10px] text-foreground-muted'>Đề xuất</p>
            </div>
            <div className='rounded-xl bg-white px-3 py-2'>
              <p className='text-lg font-extrabold text-violet-700'>{highPriority}</p>
              <p className='text-[10px] text-foreground-muted'>Ưu tiên cao</p>
            </div>
            <div className='rounded-xl bg-white px-3 py-2'>
              <p className='text-lg font-extrabold text-emerald-700'>{accepted}</p>
              <p className='text-[10px] text-foreground-muted'>Đã duyệt</p>
            </div>
          </div>
        </div>
      </section>

      <div className='grid gap-4 xl:grid-cols-2'>
        {visibleSatellites.map((satellite) => {
          const meta = PLATFORM_META[satellite.platform];
          const Icon = meta.icon;
          const isAccepted = satellite.status === 'accepted' || satellite.status === 'active';
          return (
            <article
              key={satellite.id}
              className='[content-visibility:auto] [contain-intrinsic-size:0_34rem] overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm'
            >
              <div className='border-b border-slate-100 bg-[linear-gradient(120deg,#fafafa,#fff7ed)] p-4 sm:p-5'>
                <div className='flex items-start gap-3'>
                  <span
                    className={cn(
                      'flex size-11 shrink-0 items-center justify-center rounded-2xl',
                      meta.className,
                    )}
                  >
                    <Icon className='size-5' aria-hidden />
                  </span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h2 className='text-base font-extrabold text-foreground'>
                        {satellite.profile.displayName}
                      </h2>
                      <Badge variant={isAccepted ? 'success' : 'warning'}>
                        {isAccepted ? 'Đã duyệt' : 'Đề xuất'}
                      </Badge>
                    </div>
                    <p className='mt-1 text-xs text-foreground-muted'>
                      {satellite.profile.proposedHandle} · {meta.label}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase',
                      satellite.priority === 'high'
                        ? 'bg-red-50 text-red-700'
                        : satellite.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700',
                    )}
                  >
                    {satellite.priority === 'high'
                      ? 'Ưu tiên cao'
                      : satellite.priority === 'medium'
                      ? 'Ưu tiên vừa'
                      : 'Theo dõi'}
                  </span>
                </div>
                <p className='mt-4 rounded-xl bg-white/80 p-3 text-xs leading-5 text-foreground'>
                  {satellite.profile.bio}
                </p>
              </div>

              <div className='space-y-4 p-4 sm:p-5'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-xl bg-slate-50 p-3'>
                    <p className='text-[10px] font-bold uppercase tracking-wide text-foreground-muted'>
                      Vai trò
                    </p>
                    <p className='mt-1 text-xs font-semibold leading-5 text-foreground'>
                      {satellite.profile.role}
                    </p>
                  </div>
                  <div className='rounded-xl bg-slate-50 p-3'>
                    <p className='text-[10px] font-bold uppercase tracking-wide text-foreground-muted'>
                      Nhịp đăng
                    </p>
                    <p className='mt-1 text-xs font-semibold leading-5 text-foreground'>
                      {satellite.profile.cadence}
                    </p>
                  </div>
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wide text-foreground-muted'>
                    Đối tượng
                  </p>
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {satellite.profile.audience.map((item) => (
                      <span
                        key={item}
                        className='rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700'
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className='text-[10px] font-bold uppercase tracking-wide text-foreground-muted'>
                    Trụ cột đã điền
                  </p>
                  <ul className='mt-2 grid gap-2 sm:grid-cols-2'>
                    {satellite.profile.contentPillars.slice(0, 4).map((item) => (
                      <li key={item} className='flex gap-2 text-xs text-foreground'>
                        <Sparkles className='mt-0.5 size-3.5 shrink-0 text-amber-600' aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='rounded-xl border border-violet-100 bg-violet-50/60 p-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='text-[10px] font-bold uppercase tracking-wide text-violet-700'>
                      Bằng chứng đề xuất
                    </span>
                    <span className='text-[10px] font-bold text-violet-700'>
                      Tin cậy {Math.round(satellite.confidence * 100)}%
                    </span>
                  </div>
                  <p className='mt-2 text-xs leading-5 text-violet-900/80'>
                    {satellite.rationale[0]}
                  </p>
                </div>
                <div className='flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row'>
                  <Button
                    variant='outline'
                    className='flex-1'
                    onClick={() => onOpenSatellite(satellite.id)}
                  >
                    <PencilLine className='size-4' aria-hidden />Xem hồ sơ đã điền
                  </Button>
                  {!isAccepted
                    ? (
                      <Button onClick={() => onConfirmSatellite(satellite.id)}>
                        <CheckCircle2 className='size-4' aria-hidden />Xác nhận hồ sơ
                      </Button>
                    )
                    : (
                      <Button variant='secondary' onClick={() => onNavigate('strategy')}>
                        Xem lộ trình <ArrowRight className='size-4' aria-hidden />
                      </Button>
                    )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export function WorkspaceChannelsView(props: WorkspaceChannelsViewProps) {
  return (
    <div className='mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8'>
      {props.mode === 'channels' ? <ChannelsPanel {...props} /> : <SatellitesPanel {...props} />}
    </div>
  );
}
