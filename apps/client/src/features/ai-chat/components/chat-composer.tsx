'use client';

import { ArrowUp, CornerDownLeft, Link2 } from 'lucide-react';
import { type FormEvent, type KeyboardEvent, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type ChatComposerProps = {
  onSubmit: (message: string) => void;
  isPending?: boolean;
  placeholder?: string;
  submitLabel?: string;
};

const MAX_TEXTAREA_HEIGHT = 144;

export function ChatComposer({
  onSubmit,
  isPending = false,
  placeholder = 'Nhắn HiveK AI điều bạn muốn thực hiện…',
  submitLabel,
}: ChatComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSubmit = value.trim().length > 0 && !isPending;

  function resetComposer(): void {
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function submitMessage(): void {
    const nextMessage = value.trim();
    if (!nextMessage || isPending) return;
    onSubmit(nextMessage);
    resetComposer();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    submitMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (
      event.key !== 'Enter'
      || event.shiftKey
      || event.nativeEvent.isComposing
    ) {
      return;
    }

    event.preventDefault();
    submitMessage();
  }

  function resizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }

  return (
    <div className='shrink-0 bg-[linear-gradient(to_top,var(--color-background-light)_72%,transparent)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-4 sm:px-5 sm:pb-4'>
      <form
        onSubmit={handleSubmit}
        className='mx-auto flex w-full max-w-3xl items-end gap-2 rounded-[1.35rem] border border-slate-200 bg-card p-2 shadow-[0_12px_35px_rgba(15,23,42,0.08)] transition-shadow focus-within:border-amber-300 focus-within:shadow-[0_14px_40px_rgba(245,158,11,0.12)]'
      >
        <label htmlFor='ai-chat-message' className='sr-only'>
          Nhập yêu cầu cho HiveK AI
        </label>
        <textarea
          ref={textareaRef}
          id='ai-chat-message'
          name='message'
          rows={1}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            resizeTextarea(event.currentTarget);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isPending}
          autoComplete='off'
          className='max-h-36 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-5 text-foreground outline-none placeholder:text-slate-400 disabled:cursor-not-allowed'
        />
        <button
          type='submit'
          disabled={!canSubmit}
          className={cn(
            'flex h-11 shrink-0 touch-manipulation items-center justify-center rounded-2xl bg-primary text-background-dark shadow-[0_6px_16px_rgba(245,158,11,0.24)] transition-[transform,background-color,opacity] hover:-translate-y-0.5 hover:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none motion-reduce:transform-none motion-reduce:transition-none',
            submitLabel
              ? 'min-w-28 gap-2 px-4 text-sm font-extrabold'
              : 'w-11',
          )}
          aria-label={submitLabel ?? 'Gửi tin nhắn'}
        >
          {submitLabel
            ? (
              <>
                <Link2 className='size-4' strokeWidth={2.4} aria-hidden />
                <span>{submitLabel}</span>
              </>
            )
            : <ArrowUp className='size-5' strokeWidth={2.4} aria-hidden />}
        </button>
      </form>
      <p className='mx-auto mt-2 hidden max-w-3xl items-center justify-center gap-1.5 text-center text-[10px] text-slate-400 sm:flex'>
        <CornerDownLeft className='size-3' aria-hidden />
        Enter để gửi · Shift + Enter để xuống dòng
      </p>
    </div>
  );
}
