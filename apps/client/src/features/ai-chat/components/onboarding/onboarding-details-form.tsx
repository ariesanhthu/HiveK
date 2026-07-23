'use client';

import { AlertCircle, ArrowRight, CheckCircle2, FileCheck2, Search, Sparkles } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type {
  BusinessDetails,
  BusinessDetailsInput,
} from '@/features/ai-chat/types/onboarding-types';

type OnboardingDetailsFormProps = {
  details: BusinessDetails;
  discoveryFailed: boolean;
  failureReason: string | null;
  connectedSourceCount: number;
  onSubmit: (details: BusinessDetailsInput) => void;
  onSearchAgain: () => void;
};

type EditableDetails = Omit<BusinessDetails, 'targetAudiences' | 'services'> & {
  targetAudiences: string;
  services: string;
};

const INPUT_CLASS =
  'mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100';
const TEXTAREA_CLASS =
  'mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100';

function lines(value: string): string[] {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function OnboardingDetailsForm({
  details,
  discoveryFailed,
  failureReason,
  connectedSourceCount,
  onSubmit,
  onSearchAgain,
}: OnboardingDetailsFormProps) {
  const [form, setForm] = useState<EditableDetails>(() => ({
    ...details,
    targetAudiences: details.targetAudiences.join('\n'),
    services: details.services.join('\n'),
  }));
  const [showAll, setShowAll] = useState(!details.businessName);
  const requiredComplete = Boolean(
    form.businessName.trim()
      && form.industry.trim()
      && form.primaryMarket.trim()
      && (!discoveryFailed || isHttpUrl(form.websiteUrl.trim())),
  );
  const prefilledCount = useMemo(
    () =>
      Object.values(details).filter((value) =>
        Array.isArray(value) ? value.length > 0 : value.trim().length > 0
      ).length,
    [details],
  );

  function update<K extends keyof EditableDetails>(
    key: K,
    value: EditableDetails[K],
  ): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!requiredComplete) return;

    onSubmit({
      ...form,
      businessName: form.businessName.trim(),
      websiteUrl: form.websiteUrl.trim(),
      industry: form.industry.trim(),
      summary: form.summary.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      primaryMarket: form.primaryMarket.trim(),
      targetAudiences: lines(form.targetAudiences),
      services: lines(form.services),
      brandVoiceNotes: form.brandVoiceNotes.trim(),
    });
  }

  return (
    <section
      className='overflow-hidden rounded-3xl border border-slate-200 bg-card shadow-[0_18px_55px_rgba(15,23,42,0.08)]'
      aria-labelledby='business-details-title'
    >
      <div className='border-b border-slate-100 bg-[linear-gradient(110deg,#fffaf0,#ffffff)] px-4 py-4 sm:px-5'>
        <div className='flex items-start gap-3'>
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-2xl ${
              discoveryFailed
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {discoveryFailed
              ? <AlertCircle className='size-5' aria-hidden />
              : <FileCheck2 className='size-5' aria-hidden />}
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700'>
              {discoveryFailed ? 'Cần bạn bổ sung' : 'Dữ liệu đã được điền'}
            </p>
            <h3
              id='business-details-title'
              className='mt-1 text-base font-extrabold text-foreground'
            >
              {discoveryFailed
                ? 'Cho tôi thông tin tối thiểu và một URL'
                : 'Kiểm tra hồ sơ trước khi khởi tạo'}
            </h3>
            <p className='mt-1 text-xs leading-5 text-foreground-muted sm:text-sm'>
              {discoveryFailed
                ? failureReason
                  ?? 'Tôi chưa đọc được nguồn phù hợp, nên cần bạn cung cấp dữ liệu nền.'
                : `Đã điền ${prefilledCount} nhóm thông tin từ ${connectedSourceCount} nguồn bạn chọn. Bạn có thể sửa bất kỳ trường nào.`}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className='space-y-5 p-4 sm:p-5'>
        <div className='grid gap-4 sm:grid-cols-2'>
          <label className='block text-xs font-bold text-foreground'>
            Tên thương hiệu <span className='text-rose-600'>*</span>
            <input
              required
              name='businessName'
              autoComplete='organization'
              value={form.businessName}
              onChange={(event) => update('businessName', event.target.value)}
              placeholder='Ví dụ: The TutorX Việt Nam'
              className={INPUT_CLASS}
            />
          </label>
          <label className='block text-xs font-bold text-foreground'>
            Lĩnh vực hoạt động <span className='text-rose-600'>*</span>
            <input
              required
              name='industry'
              autoComplete='organization-title'
              value={form.industry}
              onChange={(event) => update('industry', event.target.value)}
              placeholder='Ví dụ: Giáo dục và gia sư'
              className={INPUT_CLASS}
            />
          </label>
          <label className='block text-xs font-bold text-foreground'>
            Thị trường chính <span className='text-rose-600'>*</span>
            <input
              required
              name='primaryMarket'
              autoComplete='country-name'
              value={form.primaryMarket}
              onChange={(event) => update('primaryMarket', event.target.value)}
              placeholder='Ví dụ: Việt Nam'
              className={INPUT_CLASS}
            />
          </label>
          <label className='block text-xs font-bold text-foreground'>
            Website hoặc trang chính{' '}
            {discoveryFailed ? <span className='text-rose-600'>*</span> : null}
            <input
              type='url'
              required={discoveryFailed}
              name='websiteUrl'
              autoComplete='url'
              value={form.websiteUrl}
              onChange={(event) => update('websiteUrl', event.target.value)}
              placeholder='https://example.com (có thể để trống)'
              className={INPUT_CLASS}
            />
          </label>
        </div>

        {!showAll
          ? (
            <button
              type='button'
              onClick={() => setShowAll(true)}
              aria-expanded={showAll}
              aria-controls='onboarding-expanded-details'
              className='flex min-h-11 w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left text-xs font-bold text-foreground transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300'
            >
              <span className='flex items-center gap-2'>
                <Sparkles className='size-4 text-amber-700' aria-hidden />
                Xem và chỉnh toàn bộ dữ liệu đã điền
              </span>
              <ArrowRight className='size-4 text-slate-400' aria-hidden />
            </button>
          )
          : (
            <div
              id='onboarding-expanded-details'
              className='space-y-4 rounded-2xl border border-slate-200 bg-slate-50/55 p-3 sm:p-4'
            >
              <label className='block text-xs font-bold text-foreground'>
                Mô tả / định hướng thương hiệu
                <textarea
                  name='summary'
                  value={form.summary}
                  onChange={(event) => update('summary', event.target.value)}
                  placeholder='Doanh nghiệp giúp ai và tạo ra giá trị gì?'
                  className={TEXTAREA_CLASS}
                />
              </label>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='block text-xs font-bold text-foreground'>
                  Email
                  <input
                    type='email'
                    name='email'
                    autoComplete='email'
                    spellCheck={false}
                    value={form.email}
                    onChange={(event) => update('email', event.target.value)}
                    placeholder='contact@example.com'
                    className={INPUT_CLASS}
                  />
                </label>
                <label className='block text-xs font-bold text-foreground'>
                  Điện thoại
                  <input
                    type='tel'
                    name='phone'
                    autoComplete='tel'
                    value={form.phone}
                    onChange={(event) => update('phone', event.target.value)}
                    placeholder='Số liên hệ công khai'
                    className={INPUT_CLASS}
                  />
                </label>
              </div>
              <label className='block text-xs font-bold text-foreground'>
                Địa chỉ
                <input
                  name='address'
                  autoComplete='street-address'
                  value={form.address}
                  onChange={(event) => update('address', event.target.value)}
                  placeholder='Địa chỉ công khai'
                  className={INPUT_CLASS}
                />
              </label>
              <div className='grid gap-4 sm:grid-cols-2'>
                <label className='block text-xs font-bold text-foreground'>
                  Nhóm khách hàng
                  <textarea
                    name='targetAudiences'
                    value={form.targetAudiences}
                    onChange={(event) => update('targetAudiences', event.target.value)}
                    placeholder='Mỗi nhóm một dòng'
                    className={TEXTAREA_CLASS}
                  />
                </label>
                <label className='block text-xs font-bold text-foreground'>
                  Dịch vụ / sản phẩm
                  <textarea
                    name='services'
                    value={form.services}
                    onChange={(event) => update('services', event.target.value)}
                    placeholder='Mỗi dịch vụ một dòng'
                    className={TEXTAREA_CLASS}
                  />
                </label>
              </div>
              <label className='block text-xs font-bold text-foreground'>
                Ghi chú giọng thương hiệu
                <textarea
                  name='brandVoiceNotes'
                  value={form.brandVoiceNotes}
                  onChange={(event) => update('brandVoiceNotes', event.target.value)}
                  placeholder='Ví dụ: chuyên môn, đồng hành, rõ ràng'
                  className={TEXTAREA_CLASS}
                />
              </label>
            </div>
          )}

        <div className='flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs leading-5 text-emerald-900'>
          <CheckCircle2 className='mt-0.5 size-4 shrink-0' aria-hidden />
          <span>
            HIVE-K chỉ tạo bản nháp hồ sơ, kênh, chiến lược và dashboard. Bạn sẽ duyệt lại trước khi
            dùng hoặc xuất bản.
          </span>
        </div>

        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <Button variant='ghost' onClick={onSearchAgain}>
            <Search className='size-4' aria-hidden />
            Tìm lại nguồn
          </Button>
          <Button type='submit' disabled={!requiredComplete}>
            Xác nhận và khởi tạo hồ sơ
            <ArrowRight className='size-4' aria-hidden />
          </Button>
        </div>
      </form>
    </section>
  );
}
