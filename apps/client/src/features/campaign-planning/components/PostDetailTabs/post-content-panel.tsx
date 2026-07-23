'use client';

import {
  type CampaignPost,
  type PlatformId,
  type PlatformOption,
  type SocialAccount,
} from '@/features/campaign-planning/types/campaign-planning';
import { cn } from '@/lib/utils';
import { AtSign, ImagePlus, Pen, Plus, Share2, Sparkles, Target, Video, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';

type PostContentPanelProps = {
  post: CampaignPost;
  accounts: SocialAccount[];
  onPostChange: (patch: Partial<CampaignPost>) => void;
  onPlatformChange: (platform: PlatformId) => void;
  onOptimizeContent: () => void;
  onGenerateMedia: () => void;
  onAddSuggestedReply: (reply: string) => void;
};

const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'facebook', label: 'Facebook', icon: Share2 },
  { id: 'threads', label: 'Threads', icon: AtSign },
  { id: 'tiktok', label: 'TikTok', icon: Video },
];

export function PostContentPanel({
  post,
  accounts,
  onPostChange,
  onPlatformChange,
  onOptimizeContent,
  onGenerateMedia,
  onAddSuggestedReply,
}: PostContentPanelProps) {
  const [replyDraft, setReplyDraft] = useState('');
  const platformAccounts = useMemo(
    () => accounts.filter((account) => account.platform === post.platform),
    [accounts, post.platform],
  );

  return (
    <div className='mx-auto flex max-w-3xl flex-col gap-5'>
      <section>
        <label className='mb-2 block text-xs font-bold text-foreground'>
          Nền tảng & Tài khoản
        </label>
        <div className='grid gap-2 sm:grid-cols-3'>
          {PLATFORM_OPTIONS.map((platform) => {
            const Icon = platform.icon;
            const isActive = platform.id === post.platform;

            return (
              <button
                key={platform.id}
                type='button'
                onClick={() => onPlatformChange(platform.id)}
                className={cn(
                  'inline-flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-bold transition-colors',
                  isActive
                    ? 'border-primary bg-amber-50 text-amber-700 shadow-sm'
                    : 'border-primary-soft text-foreground-muted hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className='size-4' aria-hidden />
                {platform.label}
              </button>
            );
          })}
        </div>

        <select
          value={post.accountId}
          onChange={(event) => onPostChange({ accountId: event.target.value })}
          className='mt-3 h-10 w-full rounded-lg border border-primary-soft bg-background-light px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
        >
          {platformAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </section>

      <section className='rounded-lg border border-primary-soft bg-muted/40 px-3 py-2'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-2'>
            <Target className='size-4 shrink-0 text-foreground-muted' aria-hidden />
            <span className='text-xs font-bold text-foreground'>Mục tiêu:</span>
            <input
              value={post.goal}
              onChange={(event) => onPostChange({ goal: event.target.value })}
              className='min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none'
            />
          </div>
          <Pen className='size-4 shrink-0 text-foreground-muted' aria-hidden />
        </div>
      </section>

      <section>
        <div className='mb-2 flex items-center justify-between gap-3'>
          <label className='text-xs font-bold text-foreground'>Nội dung chính</label>
          <button
            type='button'
            onClick={onOptimizeContent}
            className='inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-blue-600 transition-colors hover:bg-blue-50'
          >
            <Wand2 className='size-3.5' aria-hidden />
            Tối ưu AI
          </button>
        </div>
        <textarea
          value={post.content}
          onChange={(event) => onPostChange({ content: event.target.value })}
          className='h-32 w-full resize-none rounded-lg border border-primary-soft bg-card p-3 text-sm leading-6 text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20'
        />
        <p className='mt-1 text-right text-[11px] font-medium text-foreground-muted'>
          {post.content.length} ký tự
        </p>
      </section>

      <section>
        <label className='mb-2 block text-xs font-bold text-foreground'>
          Media (Hình ảnh/Video)
        </label>
        <div className='grid gap-3 md:grid-cols-[1fr_12rem]'>
          <label className='flex aspect-[21/8] min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary-soft bg-background-light text-center transition-colors hover:border-primary'>
            <input
              type='file'
              accept='image/*,video/*'
              className='sr-only'
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onPostChange({ mediaAsset: file.name });
              }}
            />
            <ImagePlus className='size-7 text-foreground-muted' aria-hidden />
            <span className='mt-2 text-xs font-semibold text-foreground-muted'>
              {post.mediaAsset ?? 'Kéo thả hoặc tải lên file'}
            </span>
          </label>

          <div className='flex flex-col justify-end gap-2'>
            <button
              type='button'
              onClick={onGenerateMedia}
              className='inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary px-3 text-xs font-bold text-primary transition-colors hover:bg-amber-50'
            >
              <Sparkles className='size-4' aria-hidden />
              Tạo ảnh bằng AI
            </button>
            <textarea
              value={post.mediaPrompt}
              onChange={(event) => onPostChange({ mediaPrompt: event.target.value })}
              className='h-20 resize-none rounded-lg border border-primary-soft bg-card p-2 text-xs leading-5 text-foreground-muted outline-none focus:border-primary'
            />
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <div>
          <label className='mb-2 block text-xs font-bold text-foreground'>
            Bình luận đầu tiên
          </label>
          <textarea
            value={post.firstComment}
            onChange={(event) => onPostChange({ firstComment: event.target.value })}
            className='h-24 w-full resize-none rounded-lg border border-primary-soft bg-background-light p-3 text-sm leading-6 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
          />
        </div>

        <div>
          <label className='mb-2 block text-xs font-bold text-foreground'>
            Phản hồi gợi ý
          </label>
          <div className='flex flex-wrap gap-2'>
            {post.suggestedReplies.map((reply) => (
              <span
                key={reply}
                className='rounded-lg border border-primary-soft bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm'
              >
                {reply}
              </span>
            ))}
          </div>
          <form
            className='mt-2 flex gap-2'
            onSubmit={(event) => {
              event.preventDefault();
              onAddSuggestedReply(replyDraft);
              setReplyDraft('');
            }}
          >
            <input
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              placeholder='Thêm phản hồi'
              className='min-w-0 flex-1 rounded-lg border border-primary-soft bg-card px-3 py-2 text-xs outline-none focus:border-primary'
            />
            <button
              type='submit'
              className='inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary-soft text-foreground-muted transition-colors hover:bg-muted hover:text-foreground'
              aria-label='Thêm phản hồi gợi ý'
            >
              <Plus className='size-4' aria-hidden />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
