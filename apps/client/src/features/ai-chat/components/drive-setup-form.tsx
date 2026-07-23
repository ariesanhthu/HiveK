'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, FolderOpen } from 'lucide-react';
import { type FormEvent, useId, useRef, useState } from 'react';

type DriveSetupFormProps = {
  initialUrl: string;
  onComplete: (url: string) => void;
};

function isValidWebUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'drive.google.com';
  } catch {
    return false;
  }
}

export function DriveSetupForm({
  initialUrl,
  onComplete,
}: DriveSetupFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const urlInputId = useId();
  const errorId = `${urlInputId}-error`;
  const helpId = `${urlInputId}-help`;

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const normalizedUrl = url.trim();

    if (!isValidWebUrl(normalizedUrl)) {
      setError('Hãy nhập link https://drive.google.com hợp lệ.');
      urlInputRef.current?.focus();
      return;
    }

    setError('');
    setIsSubmitted(true);
    onComplete(normalizedUrl);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='mt-3 rounded-2xl border border-slate-200 bg-card p-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:p-5'
    >
      <div className='flex items-start gap-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600'>
          <FolderOpen className='size-[1.1rem]' aria-hidden />
        </span>
        <div>
          <h3 className='text-sm font-extrabold text-foreground'>
            Thêm kho tài nguyên thương hiệu
          </h3>
          <p className='mt-1 text-xs leading-5 text-foreground-muted'>
            Dán link thư mục Google Drive chứa logo, guideline hoặc ảnh sản phẩm. Chỉ thêm thư mục
            chứa tài nguyên bạn có quyền quản lý.
          </p>
        </div>
      </div>

      <div className='mt-4'>
        <Label htmlFor={urlInputId} className='text-xs font-bold'>
          Link thư mục Drive
        </Label>
        <Input
          ref={urlInputRef}
          id={urlInputId}
          name='driveUrl'
          type='url'
          inputMode='url'
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            if (error) setError('');
          }}
          placeholder='https://drive.google.com/drive/folders/…'
          autoComplete='off'
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helpId}
          className='mt-2 bg-white'
        />
        {error
          ? (
            <p
              id={errorId}
              role='alert'
              className='mt-1.5 text-xs font-medium text-red-600'
            >
              {error}
            </p>
          )
          : (
            <p id={helpId} className='mt-1.5 text-[11px] text-foreground-muted'>
              Hãy kiểm tra quyền chia sẻ của thư mục trước khi tiếp tục.
            </p>
          )}
      </div>

      <div className='mt-4 flex justify-end'>
        <Button
          type='submit'
          size='sm'
          className='h-11 touch-manipulation sm:h-9'
          disabled={!url.trim() || isSubmitted}
        >
          <Check className='size-3.5' aria-hidden />
          Xác nhận đường dẫn
        </Button>
      </div>
    </form>
  );
}
