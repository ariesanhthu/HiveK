'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  ChannelProfile,
  ChannelProfilePatch,
  SatelliteRecommendation,
  SatelliteRecommendationPatch,
} from '@/features/ai-chat/types/workspace-types';
import { CheckCircle2, ExternalLink, Save, X } from 'lucide-react';
import { type ReactNode, useEffect, useId, useState } from 'react';
import { useDrawerDialog } from './use-drawer-dialog';

function splitList(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value: string[]): string {
  return value.join('\n');
}

function createChannelPatch(profile: ChannelProfile): ChannelProfilePatch {
  return {
    displayName: profile.displayName.trim(),
    handle: profile.handle.trim(),
    url: profile.url.trim(),
    role: profile.role.trim(),
    audience: profile.audience,
    contentPillars: profile.contentPillars,
    formats: profile.formats,
    tone: profile.tone.trim(),
    cadence: profile.cadence.trim(),
  };
}

function getConnectionStatusLabel(status: ChannelProfile['connectionStatus']): string {
  switch (status) {
    case 'connected':
      return 'Đã kết nối';
    case 'needs_reconnect':
      return 'Cần kết nối lại';
    case 'planned':
      return 'Đang lên kế hoạch';
    default:
      return 'Nguồn công khai';
  }
}

function channelSignature(profile: ChannelProfile): string {
  return JSON.stringify(createChannelPatch(profile));
}

function createSatellitePatch(
  recommendation: SatelliteRecommendation,
): SatelliteRecommendationPatch {
  return {
    priority: recommendation.priority,
    effort: recommendation.effort,
    projectedImpact: recommendation.projectedImpact,
    profile: {
      displayName: recommendation.profile.displayName.trim(),
      proposedHandle: recommendation.profile.proposedHandle.trim(),
      bio: recommendation.profile.bio.trim(),
      role: recommendation.profile.role.trim(),
      audience: recommendation.profile.audience,
      contentPillars: recommendation.profile.contentPillars,
      formats: recommendation.profile.formats,
      tone: recommendation.profile.tone.trim(),
      cadence: recommendation.profile.cadence.trim(),
      cta: recommendation.profile.cta.trim(),
      guardrails: recommendation.profile.guardrails,
    },
  };
}

function satelliteSignature(recommendation: SatelliteRecommendation): string {
  return JSON.stringify(createSatellitePatch(recommendation));
}

type DrawerShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  onClose: () => void;
  hasUnsavedChanges: boolean;
  children: ReactNode;
  footer: ReactNode;
};

function DrawerShell({
  eyebrow,
  title,
  description,
  onClose,
  hasUnsavedChanges,
  children,
  footer,
}: DrawerShellProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { dialogRef, requestClose } = useDrawerDialog({
    isOpen: true,
    hasUnsavedChanges,
    onClose,
  });

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <button
        type='button'
        className='absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]'
        onClick={requestClose}
        aria-label='Đóng hồ sơ kênh'
      />
      <section
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className='relative flex h-full w-full max-w-2xl flex-col overflow-hidden border-l border-slate-200 bg-card shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40'
      >
        <header className='flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6'>
          <div className='min-w-0'>
            <p className='text-[11px] font-extrabold uppercase tracking-[0.12em] text-amber-700'>
              {eyebrow}
            </p>
            <h2 id={titleId} className='mt-1 text-xl font-extrabold text-foreground'>
              {title}
            </h2>
            <p id={descriptionId} className='mt-1 max-w-xl text-xs leading-5 text-foreground-muted'>
              {description}
            </p>
          </div>
          <Button variant='ghost' size='icon' onClick={requestClose} aria-label='Đóng'>
            <X className='size-4' aria-hidden />
          </Button>
        </header>
        <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6'>
          {children}
        </div>
        <footer className='shrink-0 border-t border-slate-200 bg-card px-4 py-4 sm:px-6'>
          {footer}
        </footer>
      </section>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
};

function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id} className='text-xs font-bold'>
        {label}
      </Label>
      <div className='mt-2'>{children}</div>
      {hint ? <p className='mt-1.5 text-[11px] leading-4 text-foreground-muted'>{hint}</p> : null}
    </div>
  );
}

type ChannelProfileDrawerProps = {
  channel: ChannelProfile | null;
  onClose: () => void;
  onUpdate: (channelId: string, patch: ChannelProfilePatch) => void;
  onConfirm: (channelId: string) => void;
};

export function ChannelProfileDrawer({
  channel,
  onClose,
  onUpdate,
  onConfirm,
}: ChannelProfileDrawerProps) {
  const [draft, setDraft] = useState<ChannelProfile | null>(channel);
  const [savedSignature, setSavedSignature] = useState(() =>
    channel ? channelSignature(channel) : ''
  );

  useEffect(() => {
    setDraft(channel);
    setSavedSignature(channel ? channelSignature(channel) : '');
  }, [channel]);

  const hasUnsavedChanges = draft
    ? channelSignature(draft) !== savedSignature
    : false;

  if (!channel || !draft) return null;
  const activeChannel = channel;
  const activeDraft = draft;

  function save(): void {
    const patch = createChannelPatch(activeDraft);
    onUpdate(activeChannel.id, patch);
    setSavedSignature(JSON.stringify(patch));
  }

  function saveAndConfirm(): void {
    onUpdate(activeChannel.id, createChannelPatch(activeDraft));
    onConfirm(activeChannel.id);
    onClose();
  }

  return (
    <DrawerShell
      eyebrow={`${channel.platform} channel`}
      title={draft.displayName}
      description='Hồ sơ đã có vai trò, đối tượng, nhịp đăng và quyền truy cập. Chỉnh các trường cần thiết trước khi xác nhận.'
      onClose={onClose}
      hasUnsavedChanges={hasUnsavedChanges}
      footer={
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button variant='outline' onClick={save}>
            <Save className='size-4' aria-hidden />
            Lưu chỉnh sửa
          </Button>
          <Button onClick={saveAndConfirm}>
            <CheckCircle2 className='size-4' aria-hidden />
            Lưu và xác nhận kênh
          </Button>
        </div>
      }
    >
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant={channel.status === 'confirmed' ? 'success' : 'warning'}>
          {channel.status === 'confirmed' ? 'Đã xác nhận' : 'Cần xác nhận'}
        </Badge>
        <Badge variant='secondary'>
          {channel.dataQuality === 'estimated' ? 'Chỉ số ước tính' : 'Dữ liệu đã đối chiếu'}
        </Badge>
        <a
          href={channel.url}
          target='_blank'
          rel='noreferrer'
          className='ml-auto inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-foreground-muted hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'
        >
          Mở kênh thật
          <ExternalLink className='size-3.5' aria-hidden />
        </a>
      </div>

      <div className='mt-5 grid gap-4 sm:grid-cols-2'>
        <Field id='channel-name' label='Tên hiển thị'>
          <Input
            id='channel-name'
            data-drawer-initial-focus
            value={draft.displayName}
            onChange={(event) => setDraft({ ...draft, displayName: event.target.value })}
          />
        </Field>
        <Field id='channel-handle' label='Handle'>
          <Input
            id='channel-handle'
            value={draft.handle}
            onChange={(event) => setDraft({ ...draft, handle: event.target.value })}
          />
        </Field>
        <div className='sm:col-span-2'>
          <Field id='channel-url' label='URL chính thức'>
            <Input
              id='channel-url'
              type='url'
              value={draft.url}
              onChange={(event) => setDraft({ ...draft, url: event.target.value })}
            />
          </Field>
        </div>
        <Field id='channel-role' label='Vai trò kênh'>
          <Input
            id='channel-role'
            value={draft.role}
            onChange={(event) => setDraft({ ...draft, role: event.target.value })}
          />
        </Field>
        <Field id='channel-cadence' label='Nhịp đăng'>
          <Input
            id='channel-cadence'
            value={draft.cadence}
            onChange={(event) => setDraft({ ...draft, cadence: event.target.value })}
          />
        </Field>
        <div className='sm:col-span-2'>
          <Field id='channel-tone' label='Giọng điệu theo kênh'>
            <Input
              id='channel-tone'
              value={draft.tone}
              onChange={(event) => setDraft({ ...draft, tone: event.target.value })}
            />
          </Field>
        </div>
        <Field id='channel-audience' label='Nhóm khán giả' hint='Mỗi dòng là một nhóm.'>
          <textarea
            id='channel-audience'
            rows={5}
            value={joinList(draft.audience)}
            onChange={(event) => setDraft({ ...draft, audience: splitList(event.target.value) })}
            className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
          />
        </Field>
        <Field id='channel-pillars' label='Trụ cột nội dung' hint='Mỗi dòng là một trụ cột.'>
          <textarea
            id='channel-pillars'
            rows={5}
            value={joinList(draft.contentPillars)}
            onChange={(event) =>
              setDraft({ ...draft, contentPillars: splitList(event.target.value) })}
            className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
          />
        </Field>
        <Field id='channel-formats' label='Định dạng ưu tiên' hint='Mỗi dòng là một định dạng.'>
          <textarea
            id='channel-formats'
            rows={4}
            value={joinList(draft.formats)}
            onChange={(event) => setDraft({ ...draft, formats: splitList(event.target.value) })}
            className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
          />
        </Field>
      </div>

      <section
        className='mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4'
        aria-labelledby='channel-connector-title'
      >
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div>
            <h3 id='channel-connector-title' className='text-xs font-extrabold text-foreground'>
              Connector & quyền truy cập
            </h3>
            <p className='mt-1 text-[11px] leading-4 text-foreground-muted'>
              Thông tin chỉ đọc, được cấp bởi connector hoặc nguồn công khai.
            </p>
          </div>
          <Badge variant={channel.connectionStatus === 'connected' ? 'success' : 'secondary'}>
            {getConnectionStatusLabel(channel.connectionStatus)}
          </Badge>
        </div>
        <dl className='mt-4 grid gap-3 text-xs sm:grid-cols-2'>
          <div className='rounded-xl bg-card p-3'>
            <dt className='font-semibold text-foreground-muted'>Quyền đọc dữ liệu</dt>
            <dd className='mt-1 font-extrabold text-foreground'>
              {channel.canRead ? 'Đã cấp' : 'Chưa cấp'}
            </dd>
          </div>
          <div className='rounded-xl bg-card p-3'>
            <dt className='font-semibold text-foreground-muted'>Quyền xuất bản</dt>
            <dd className='mt-1 font-extrabold text-foreground'>
              {channel.canPublish ? 'Đã cấp' : 'Chưa cấp'}
            </dd>
          </div>
        </dl>
        <p className='mt-3 text-[11px] leading-4 text-foreground-muted'>
          Muốn thay đổi kết nối hoặc quyền, hãy lưu hồ sơ rồi quản lý tại Studio → Nguồn & quyền.
        </p>
      </section>
    </DrawerShell>
  );
}

type SatelliteProfileDrawerProps = {
  satellite: SatelliteRecommendation | null;
  onClose: () => void;
  onUpdate: (satelliteId: string, patch: SatelliteRecommendationPatch) => void;
  onConfirm: (satelliteId: string) => void;
};

export function SatelliteProfileDrawer({
  satellite,
  onClose,
  onUpdate,
  onConfirm,
}: SatelliteProfileDrawerProps) {
  const [draft, setDraft] = useState<SatelliteRecommendation | null>(satellite);
  const [savedSignature, setSavedSignature] = useState(() =>
    satellite ? satelliteSignature(satellite) : ''
  );

  useEffect(() => {
    setDraft(satellite);
    setSavedSignature(satellite ? satelliteSignature(satellite) : '');
  }, [satellite]);

  const hasUnsavedChanges = draft
    ? satelliteSignature(draft) !== savedSignature
    : false;

  if (!satellite || !draft) return null;
  const activeSatellite = satellite;
  const activeDraft = draft;

  function updateProfile(patch: Partial<SatelliteRecommendation['profile']>): void {
    setDraft((previous) =>
      previous
        ? { ...previous, profile: { ...previous.profile, ...patch } }
        : previous
    );
  }

  function save(): void {
    const patch = createSatellitePatch(activeDraft);
    onUpdate(activeSatellite.id, patch);
    setSavedSignature(JSON.stringify(patch));
  }

  function saveAndConfirm(): void {
    onUpdate(activeSatellite.id, createSatellitePatch(activeDraft));
    onConfirm(activeSatellite.id);
    onClose();
  }

  return (
    <DrawerShell
      eyebrow={`${satellite.platform} satellite`}
      title={draft.profile.displayName}
      description='Hồ sơ vệ tinh đã được điền từ khoảng trống đối tượng và mục tiêu. Việc xác nhận chỉ lưu cấu hình; không tự tạo tài khoản hoặc đăng nội dung.'
      onClose={onClose}
      hasUnsavedChanges={hasUnsavedChanges}
      footer={
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <Button variant='outline' onClick={save}>
            <Save className='size-4' aria-hidden />
            Lưu hồ sơ nháp
          </Button>
          <Button onClick={saveAndConfirm}>
            <CheckCircle2 className='size-4' aria-hidden />
            Xác nhận hồ sơ vệ tinh
          </Button>
        </div>
      }
    >
      <div className='flex flex-wrap gap-2'>
        <Badge
          variant={satellite.status === 'accepted' || satellite.status === 'active'
            ? 'success'
            : 'warning'}
        >
          {satellite.status === 'accepted'
            ? 'Đã chấp nhận'
            : satellite.status === 'active'
            ? 'Đang vận hành'
            : 'Đang đề xuất'}
        </Badge>
        <Badge variant='secondary'>Tin cậy {Math.round(satellite.confidence * 100)}%</Badge>
        <Badge variant='outline'>
          Nỗ lực{' '}
          {satellite.effort === 'low' ? 'thấp' : satellite.effort === 'medium' ? 'vừa' : 'cao'}
        </Badge>
      </div>

      <div className='mt-5 grid gap-4 sm:grid-cols-2'>
        <Field id='satellite-name' label='Tên trang/kênh'>
          <Input
            id='satellite-name'
            data-drawer-initial-focus
            value={draft.profile.displayName}
            onChange={(event) => updateProfile({ displayName: event.target.value })}
          />
        </Field>
        <Field id='satellite-handle' label='Handle đề xuất'>
          <Input
            id='satellite-handle'
            value={draft.profile.proposedHandle}
            onChange={(event) => updateProfile({ proposedHandle: event.target.value })}
          />
        </Field>
        <div className='sm:col-span-2'>
          <Field id='satellite-bio' label='Bio đã điền'>
            <textarea
              id='satellite-bio'
              rows={4}
              value={draft.profile.bio}
              onChange={(event) => updateProfile({ bio: event.target.value })}
              className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
            />
          </Field>
        </div>
        <Field id='satellite-role' label='Vai trò kênh'>
          <Input
            id='satellite-role'
            value={draft.profile.role}
            onChange={(event) => updateProfile({ role: event.target.value })}
          />
        </Field>
        <Field id='satellite-cadence' label='Nhịp đăng'>
          <Input
            id='satellite-cadence'
            value={draft.profile.cadence}
            onChange={(event) => updateProfile({ cadence: event.target.value })}
          />
        </Field>
        <div className='sm:col-span-2'>
          <Field id='satellite-tone' label='Giọng điệu'>
            <Input
              id='satellite-tone'
              value={draft.profile.tone}
              onChange={(event) => updateProfile({ tone: event.target.value })}
            />
          </Field>
        </div>
        <Field id='satellite-audience' label='Đối tượng' hint='Mỗi dòng là một nhóm.'>
          <textarea
            id='satellite-audience'
            rows={5}
            value={joinList(draft.profile.audience)}
            onChange={(event) => updateProfile({ audience: splitList(event.target.value) })}
            className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
          />
        </Field>
        <Field id='satellite-pillars' label='Trụ cột nội dung' hint='Mỗi dòng là một trụ cột.'>
          <textarea
            id='satellite-pillars'
            rows={5}
            value={joinList(draft.profile.contentPillars)}
            onChange={(event) => updateProfile({ contentPillars: splitList(event.target.value) })}
            className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
          />
        </Field>
        <Field id='satellite-formats' label='Định dạng' hint='Mỗi dòng là một định dạng.'>
          <textarea
            id='satellite-formats'
            rows={4}
            value={joinList(draft.profile.formats)}
            onChange={(event) => updateProfile({ formats: splitList(event.target.value) })}
            className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
          />
        </Field>
        <Field
          id='satellite-guardrails'
          label='Điều không được làm'
          hint='Mỗi dòng là một quy tắc.'
        >
          <textarea
            id='satellite-guardrails'
            rows={4}
            value={joinList(draft.profile.guardrails)}
            onChange={(event) => updateProfile({ guardrails: splitList(event.target.value) })}
            className='w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-amber-300 focus:ring-2 focus:ring-primary/20'
          />
        </Field>
        <div className='sm:col-span-2'>
          <Field id='satellite-cta' label='CTA mặc định'>
            <Input
              id='satellite-cta'
              value={draft.profile.cta}
              onChange={(event) => updateProfile({ cta: event.target.value })}
            />
          </Field>
        </div>
      </div>

      <section className='mt-6 rounded-2xl border border-violet-200 bg-violet-50/60 p-4'>
        <h3 className='text-sm font-extrabold text-violet-900'>Vì sao kênh này được đề xuất?</h3>
        <ul className='mt-3 space-y-2 text-xs leading-5 text-violet-900/80'>
          {satellite.rationale.map((reason) => <li key={reason}>• {reason}</li>)}
        </ul>
        <p className='mt-3 border-t border-violet-200 pt-3 text-xs font-semibold text-violet-900'>
          Tác động kỳ vọng: {satellite.projectedImpact}
        </p>
      </section>
    </DrawerShell>
  );
}
