import { CHANNEL_LABELS } from '@/features/inbox/components/inbox-labels';
import type { InboxChannel } from '@/features/inbox/types';
import { cn } from '@/lib/utils';

const AVATAR_SIZE_CLASSES = {
  xs: 'size-9 text-xs',
  sm: 'size-10 text-xs',
  md: 'size-14 text-sm',
} as const;

const BADGE_SIZE_CLASSES = {
  xs: 'size-4',
  sm: 'size-[18px]',
  md: 'size-5',
} as const;

function MessengerMark() {
  return (
    <span className='flex size-full items-center justify-center rounded-full bg-[#168AFF] text-white'>
      <svg viewBox='0 0 16 16' className='size-[70%]' fill='none' aria-hidden>
        <path
          d='M2.2 8c0-3.2 2.5-5.6 5.8-5.6s5.8 2.4 5.8 5.6-2.5 5.6-5.8 5.6c-.6 0-1.2-.1-1.8-.3l-2.4 1.3.1-2.4A5.4 5.4 0 0 1 2.2 8Z'
          fill='currentColor'
        />
        <path d='m4.7 9.6 2.2-2.4 1.8 1.3 2.6-2.1-2.2 2.5-1.8-1.3-2.6 2Z' fill='#168AFF' />
      </svg>
    </span>
  );
}

function InstagramMark() {
  return (
    <span className='flex size-full items-center justify-center rounded-full bg-[linear-gradient(145deg,#8B5CF6,#EC4899,#F59E0B)] text-white'>
      <svg viewBox='0 0 16 16' className='size-[66%]' fill='none' aria-hidden>
        <rect
          x='2.3'
          y='2.3'
          width='11.4'
          height='11.4'
          rx='3.4'
          stroke='currentColor'
          strokeWidth='1.7'
        />
        <circle cx='8' cy='8' r='2.5' stroke='currentColor' strokeWidth='1.5' />
        <circle cx='11.7' cy='4.5' r='.8' fill='currentColor' />
      </svg>
    </span>
  );
}

function ThreadsMark() {
  return (
    <span
      className='flex size-full items-center justify-center rounded-full bg-slate-950 text-[11px] font-black leading-none text-white'
      aria-hidden
    >
      @
    </span>
  );
}

export function ChannelSourceBadge({
  channel,
  size = 'sm',
  className,
}: {
  channel: InboxChannel;
  size?: keyof typeof AVATAR_SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 rounded-full border-2 border-card shadow-sm',
        BADGE_SIZE_CLASSES[size],
        className,
      )}
      aria-label={`Nguồn: ${CHANNEL_LABELS[channel]}`}
      title={CHANNEL_LABELS[channel]}
    >
      {channel === 'messenger'
        ? <MessengerMark />
        : channel === 'instagram'
        ? <InstagramMark />
        : <ThreadsMark />}
    </span>
  );
}

export function ChannelAvatar({
  initials,
  channel,
  size = 'sm',
  className,
}: {
  initials: string;
  channel: InboxChannel;
  size?: keyof typeof AVATAR_SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span className={cn('relative inline-flex shrink-0', AVATAR_SIZE_CLASSES[size], className)}>
      <span className='flex size-full items-center justify-center rounded-full bg-muted font-extrabold text-foreground'>
        {initials}
      </span>
      <ChannelSourceBadge
        channel={channel}
        size={size}
        className='absolute -bottom-0.5 -right-0.5'
      />
    </span>
  );
}
