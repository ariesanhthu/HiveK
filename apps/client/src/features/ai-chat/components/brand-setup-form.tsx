'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BRAND_TONE_OPTIONS } from '@/features/ai-chat/data/ai-chat-data';
import type { BrandToneId } from '@/features/ai-chat/types';
import { cn } from '@/lib/utils';
import { Check, Palette } from 'lucide-react';
import { type FormEvent, useId, useState } from 'react';

type BrandSetupFormProps = {
  initialName: string;
  initialTone: BrandToneId | null;
  onComplete: (name: string, tone: BrandToneId) => void;
};

export function BrandSetupForm({
  initialName,
  initialTone,
  onComplete,
}: BrandSetupFormProps) {
  const [name, setName] = useState(initialName);
  const [tone, setTone] = useState<BrandToneId | null>(initialTone);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const nameInputId = useId();
  const canSubmit = name.trim().length > 0 && tone !== null && !isSubmitted;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit || !tone) return;
    setIsSubmitted(true);
    onComplete(name.trim(), tone);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='mt-3 rounded-2xl border border-slate-200 bg-card p-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:p-5'
    >
      <div className='flex items-start gap-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600'>
          <Palette className='size-[1.1rem]' aria-hidden />
        </span>
        <div>
          <h3 className='text-sm font-extrabold text-foreground'>
            Thiết lập nhận diện cơ bản
          </h3>
          <p className='mt-1 text-xs leading-5 text-foreground-muted'>
            Thông tin này giúp các gợi ý giữ đúng cách thương hiệu giao tiếp.
          </p>
        </div>
      </div>

      <div className='mt-4'>
        <Label htmlFor={nameInputId} className='text-xs font-bold'>
          Tên thương hiệu
        </Label>
        <Input
          id={nameInputId}
          name='brandName'
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder='Ví dụ: HiveK'
          autoComplete='organization'
          className='mt-2 bg-white'
        />
      </div>

      <fieldset className='mt-4'>
        <legend className='text-xs font-bold text-foreground'>
          Giọng điệu chủ đạo
        </legend>
        <div className='mt-2 grid gap-2 sm:grid-cols-2'>
          {BRAND_TONE_OPTIONS.map((option) => {
            const isSelected = tone === option.id;

            return (
              <label key={option.id} className='block cursor-pointer'>
                <input
                  type='radio'
                  name='brandTone'
                  value={option.id}
                  checked={isSelected}
                  onChange={() => setTone(option.id)}
                  className='peer sr-only'
                />
                <span
                  className={cn(
                    'relative block min-h-full rounded-xl border p-3 pr-8 text-left transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40',
                    isSelected
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50',
                  )}
                >
                  <span className='block text-xs font-bold text-foreground'>
                    {option.label}
                  </span>
                  <span className='mt-1 block text-[11px] leading-4 text-foreground-muted'>
                    {option.description}
                  </span>
                  {isSelected
                    ? (
                      <span className='absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white'>
                        <Check className='size-2.5' strokeWidth={3} aria-hidden />
                      </span>
                    )
                    : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className='mt-4 flex justify-end'>
        <Button
          type='submit'
          size='sm'
          className='h-11 touch-manipulation sm:h-9'
          disabled={!canSubmit}
        >
          Lưu nhận diện
        </Button>
      </div>
    </form>
  );
}
