'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  OBJECTIVE_OPTIONS,
  PLATFORM_OPTIONS,
  TONE_OPTIONS,
} from '@/features/campaign-management/data/campaign-management-options';
import type { CampaignFormInput, PlatformId } from '@/features/campaign-management/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';

type CampaignCreateDrawerProps = {
  isOpen: boolean;
  defaultForm: CampaignFormInput;
  mode?: 'create' | 'edit';
  onClose: () => void;
  onCreateCampaign: (input: CampaignFormInput) => void;
};

const STEPS = [
  'Thông tin chính',
  'Nội dung & Tone',
  'Media & Brand',
  'AI Generate',
  'KOL/KOC & Người tham gia',
];

function Textarea(props: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-24 w-full resize-none rounded-xl border border-primary-soft bg-muted/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
        props.className,
      )}
    />
  );
}

function Field({
  label,
  children,
  helper,
}: {
  label: string;
  children: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className='space-y-1.5'>
      <Label>{label}</Label>
      {children}
      {helper ? <p className='text-xs text-foreground-muted'>{helper}</p> : null}
    </div>
  );
}

export function CampaignCreateDrawer({
  isOpen,
  defaultForm,
  mode = 'create',
  onClose,
  onCreateCampaign,
}: CampaignCreateDrawerProps) {
  const [form, setForm] = useState(defaultForm);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    setForm(defaultForm);
    setActiveStep(0);
  }, [defaultForm, isOpen]);

  if (!isOpen) return null;

  const updateForm = <Key extends keyof CampaignFormInput>(
    key: Key,
    value: CampaignFormInput[Key],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const togglePlatform = (platform: PlatformId) => {
    setForm((current) => {
      const nextPlatforms = current.platforms.includes(platform)
        ? current.platforms.filter((item) => item !== platform)
        : [...current.platforms, platform];

      return {
        ...current,
        platforms: nextPlatforms.length > 0 ? nextPlatforms : current.platforms,
      };
    });
  };

  const canCreate = form.name.trim()
    && form.description.trim()
    && form.keyMessage.trim()
    && form.targetAudience.trim()
    && form.cta.trim()
    && form.platforms.length > 0;

  return (
    <div className='fixed inset-0 z-50 flex justify-end bg-slate-950/30'>
      <div className='h-full w-full max-w-3xl overflow-hidden bg-card shadow-2xl'>
        <div className='flex h-full flex-col'>
          <header className='flex shrink-0 items-start justify-between gap-4 border-b border-primary-soft px-5 py-4'>
            <div>
              <h2 className='text-lg font-extrabold text-foreground'>
                {mode === 'edit' ? 'Sửa brief chiến dịch' : 'Tạo chiến dịch mới'}
              </h2>
              <p className='mt-1 text-xs leading-5 text-foreground-muted'>
                Nhập thông tin để AI hiểu mục tiêu, khách hàng, tone giọng và tài nguyên của chiến
                dịch.
              </p>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg p-2 text-foreground-muted hover:bg-muted hover:text-foreground'
              aria-label='Đóng'
            >
              <X className='size-4' aria-hidden />
            </button>
          </header>

          <div className='flex shrink-0 gap-2 overflow-x-auto border-b border-primary-soft px-5 py-3'>
            {STEPS.map((step, index) => (
              <button
                key={step}
                type='button'
                onClick={() => setActiveStep(index)}
                className={cn(
                  'whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                  activeStep === index
                    ? 'border-primary bg-primary-soft text-primary'
                    : 'border-primary-soft text-foreground-muted hover:bg-muted',
                )}
              >
                {index + 1}. {step}
              </button>
            ))}
          </div>

          <div className='min-h-0 flex-1 overflow-y-auto px-5 py-5'>
            {activeStep === 0
              ? (
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field label='Tên chiến dịch *'>
                    <Input
                      value={form.name}
                      onChange={(event) => updateForm('name', event.target.value)}
                      placeholder='Summer Travel Campaign'
                    />
                  </Field>
                  <Field label='Mục tiêu chiến dịch *'>
                    <select
                      value={form.objective}
                      onChange={(event) =>
                        updateForm(
                          'objective',
                          event.target.value as CampaignFormInput['objective'],
                        )}
                      className='h-11 w-full rounded-xl border border-primary-soft bg-muted/60 px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/25'
                    >
                      {OBJECTIVE_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label='Nền tảng *'>
                    <div className='flex flex-wrap gap-2'>
                      {PLATFORM_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type='button'
                          onClick={() => togglePlatform(option.id)}
                          className={cn(
                            'rounded-full border px-3 py-2 text-xs font-bold transition-colors',
                            form.platforms.includes(option.id)
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-primary-soft bg-card text-foreground-muted hover:bg-muted',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label='Sản phẩm / Dịch vụ liên quan'>
                    <Input
                      value={form.productName}
                      onChange={(event) => updateForm('productName', event.target.value)}
                      placeholder='Combo du lịch hè'
                    />
                  </Field>
                  <Field label='CTA chính *'>
                    <Input
                      value={form.cta}
                      onChange={(event) => updateForm('cta', event.target.value)}
                      placeholder='Đăng ký nhận tư vấn'
                    />
                  </Field>
                  <Field label='Landing URL / Link sản phẩm'>
                    <Input
                      value={form.landingUrl}
                      onChange={(event) => updateForm('landingUrl', event.target.value)}
                      placeholder='https://...'
                    />
                  </Field>
                </div>
              )
              : null}

            {activeStep === 1
              ? (
                <div className='space-y-4'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <Field label='Mô tả chiến dịch *'>
                      <Textarea
                        value={form.description}
                        onChange={(event) => updateForm('description', event.target.value)}
                      />
                    </Field>
                    <Field label='Thông điệp chính *'>
                      <Textarea
                        value={form.keyMessage}
                        onChange={(event) => updateForm('keyMessage', event.target.value)}
                      />
                    </Field>
                    <Field label='Khách hàng mục tiêu *'>
                      <Textarea
                        value={form.targetAudience}
                        onChange={(event) => updateForm('targetAudience', event.target.value)}
                      />
                    </Field>
                    <Field label='Insight khách hàng'>
                      <Textarea
                        value={form.customerInsight}
                        onChange={(event) => updateForm('customerInsight', event.target.value)}
                      />
                    </Field>
                    <Field label='Điểm nổi bật / USP'>
                      <Input
                        value={form.usp}
                        onChange={(event) => updateForm('usp', event.target.value)}
                      />
                    </Field>
                    <Field label='Ưu đãi'>
                      <Input
                        value={form.offer}
                        onChange={(event) => updateForm('offer', event.target.value)}
                      />
                    </Field>
                  </div>

                  <Field
                    label='Tone giọng *'
                    helper='Tone này sẽ được dùng để AI viết caption, gợi ý lịch đăng và tạo tin nhắn liên hệ KOL/KOC.'
                  >
                    <div className='flex flex-wrap gap-2'>
                      {TONE_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type='button'
                          onClick={() => updateForm('tonePreset', option.id)}
                          className={cn(
                            'rounded-full border px-3 py-2 text-xs font-bold transition-colors',
                            form.tonePreset === option.id
                              ? 'border-primary bg-primary-soft text-primary'
                              : 'border-primary-soft bg-card text-foreground-muted hover:bg-muted',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <Field label='Mức độ trang trọng: 1 - 5'>
                      <Input
                        type='number'
                        min={1}
                        max={5}
                        value={form.formality}
                        onChange={(event) =>
                          updateForm(
                            'formality',
                            Number(event.target.value) as CampaignFormInput['formality'],
                          )}
                      />
                    </Field>
                    <Field label='Emoji'>
                      <select
                        value={form.emojiLevel}
                        onChange={(event) =>
                          updateForm(
                            'emojiLevel',
                            event.target.value as CampaignFormInput['emojiLevel'],
                          )}
                        className='h-11 w-full rounded-xl border border-primary-soft bg-muted/60 px-3 text-sm'
                      >
                        <option value='none'>Không dùng</option>
                        <option value='low'>Ít</option>
                        <option value='medium'>Vừa phải</option>
                        <option value='high'>Nhiều</option>
                      </select>
                    </Field>
                    <Field label='Từ khóa bắt buộc'>
                      <Input
                        value={form.requiredKeywords}
                        onChange={(event) => updateForm('requiredKeywords', event.target.value)}
                        placeholder='du lịch hè, trải nghiệm'
                      />
                    </Field>
                    <Field label='Hashtag gợi ý'>
                      <Input
                        value={form.suggestedHashtags}
                        onChange={(event) => updateForm('suggestedHashtags', event.target.value)}
                        placeholder='#HiveK, #KOC'
                      />
                    </Field>
                  </div>
                </div>
              )
              : null}

            {activeStep === 2
              ? (
                <div className='space-y-4'>
                  <div className='grid gap-4 md:grid-cols-2'>
                    {['Logo thương hiệu', 'Ảnh sản phẩm', 'Ảnh lifestyle', 'Video tham khảo'].map(
                      (label) => (
                        <div
                          key={label}
                          className='rounded-xl border border-dashed border-primary-soft bg-background-light p-5 text-center'
                        >
                          <p className='text-sm font-bold text-foreground'>{label}</p>
                          <p className='mt-1 text-xs text-foreground-muted'>
                            Kéo thả hoặc tải file
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                  <div className='rounded-xl border border-primary-soft bg-background-light p-4'>
                    <p className='text-sm font-bold text-foreground'>Tuỳ chọn AI image</p>
                    <div className='mt-3 grid gap-3 text-sm text-foreground-muted md:grid-cols-2'>
                      <label className='flex items-center gap-2'>
                        <input type='checkbox' defaultChecked />{' '}
                        Dùng media này cho toàn bộ chiến dịch
                      </label>
                      <label className='flex items-center gap-2'>
                        <input type='checkbox' defaultChecked /> Cho phép AI tạo ảnh mới
                      </label>
                      <label className='flex items-center gap-2'>
                        <input type='checkbox' /> Bắt buộc gắn logo vào ảnh
                      </label>
                      <label className='flex items-center gap-2'>
                        <input type='checkbox' /> Dùng màu chủ đạo của brand
                      </label>
                    </div>
                  </div>
                </div>
              )
              : null}

            {activeStep === 3
              ? (
                <div className='grid gap-4 md:grid-cols-2'>
                  <Field label='Số bài muốn tạo *'>
                    <Input
                      type='number'
                      min={1}
                      value={form.numberOfPosts}
                      onChange={(event) => updateForm('numberOfPosts', Number(event.target.value))}
                    />
                  </Field>
                  <Field label='Số phiên bản mỗi bài'>
                    <Input
                      type='number'
                      min={1}
                      value={form.variantsPerPost}
                      onChange={(event) =>
                        updateForm('variantsPerPost', Number(event.target.value))}
                    />
                  </Field>
                  <Field label='Mức sáng tạo: 1 - 5'>
                    <Input
                      type='number'
                      min={1}
                      max={5}
                      value={form.creativity}
                      onChange={(event) =>
                        updateForm(
                          'creativity',
                          Number(event.target.value) as CampaignFormInput['creativity'],
                        )}
                    />
                  </Field>
                  <Field label='Chế độ duyệt'>
                    <select
                      value={form.approvalMode}
                      onChange={(event) =>
                        updateForm(
                          'approvalMode',
                          event.target.value as CampaignFormInput['approvalMode'],
                        )}
                      className='h-11 w-full rounded-xl border border-primary-soft bg-muted/60 px-3 text-sm'
                    >
                      <option value='per_post'>Duyệt từng bài</option>
                      <option value='approve_all'>Duyệt tất cả</option>
                      <option value='auto_schedule_after_approval'>
                        Tự động lên lịch sau khi duyệt
                      </option>
                    </select>
                  </Field>
                  <div className='md:col-span-2 rounded-xl border border-primary-soft bg-background-light p-4'>
                    <p className='text-sm font-bold text-foreground'>Loại nội dung cần tạo</p>
                    <div className='mt-3 grid gap-3 text-sm text-foreground-muted md:grid-cols-3'>
                      {[
                        'Caption',
                        'Hashtag',
                        'CTA',
                        'Media prompt',
                        'Lịch đăng',
                        'Tin nhắn KOL/KOC',
                      ].map(
                        (item) => (
                          <label key={item} className='flex items-center gap-2'>
                            <input type='checkbox' defaultChecked /> {item}
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )
              : null}

            {activeStep === 4
              ? (
                <div className='space-y-4'>
                  <label className='flex items-center gap-2 rounded-xl border border-primary-soft bg-background-light p-4 text-sm font-semibold text-foreground'>
                    <input
                      type='checkbox'
                      checked={form.inviteEnabled}
                      onChange={(event) => updateForm('inviteEnabled', event.target.checked)}
                    />
                    Bật link mời tham gia chiến dịch
                  </label>
                  <Field label='Mã mời mặc định'>
                    <Input
                      value={form.inviteCode}
                      onChange={(event) => updateForm('inviteCode', event.target.value)}
                    />
                  </Field>
                  <div className='rounded-xl border border-primary-soft bg-background-light p-4'>
                    <p className='text-sm font-bold text-foreground'>
                      Quyền của người được mời
                    </p>
                    <div className='mt-3 grid gap-3 text-sm text-foreground-muted md:grid-cols-2'>
                      {[
                        'Xem brief',
                        'Upload media',
                        'Gửi nội dung nháp',
                        'Xem lịch đăng',
                        'Xem hiệu quả chiến dịch',
                      ].map((item) => (
                        <label key={item} className='flex items-center gap-2'>
                          <input type='checkbox' defaultChecked /> {item}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )
              : null}
          </div>

          <footer className='flex shrink-0 flex-col gap-2 border-t border-primary-soft px-5 py-4 sm:flex-row sm:justify-end'>
            <Button variant='ghost' onClick={onClose}>
              Huỷ
            </Button>
            <Button variant='outline' onClick={() => onCreateCampaign(form)}>
              Lưu bản nháp
            </Button>
            <Button
              disabled={!canCreate}
              onClick={() => {
                onCreateCampaign(form);
                onClose();
              }}
            >
              {mode === 'edit' ? 'Lưu brief' : 'Tạo chiến dịch'}
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
