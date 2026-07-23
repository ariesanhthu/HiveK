import { Button } from '@/components/ui/button';
import { ChannelAvatar } from '@/features/inbox/components/channel-avatar';
import {
  CHANNEL_LABELS,
  HANDLING_MODE_LABELS,
  STATUS_LABELS,
} from '@/features/inbox/components/inbox-labels';
import { MessageTimeline } from '@/features/inbox/components/message-timeline';
import { ReplyComposer } from '@/features/inbox/components/reply-composer';
import type { ComposerMode, InboxConversation } from '@/features/inbox/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, Bot, CheckCircle2, Ellipsis, Info, Star, UserRoundCheck } from 'lucide-react';

type ConversationPanelProps = {
  conversation: InboxConversation;
  mode: ComposerMode;
  draft: string;
  suggestion: string;
  isSending: boolean;
  onBack: () => void;
  onOpenContext: () => void;
  onTakeOver: () => void;
  onReturnToAi: () => void;
  onToggleResolved: () => void;
  onTogglePriority: () => void;
  onModeChange: (mode: ComposerMode) => void;
  onDraftChange: (value: string) => void;
  onSuggestionChange: (value: string) => void;
  onSuggest: () => void;
  onSend: () => void;
};

export function ConversationPanel({
  conversation,
  mode,
  draft,
  suggestion,
  isSending,
  onBack,
  onOpenContext,
  onTakeOver,
  onReturnToAi,
  onToggleResolved,
  onTogglePriority,
  onModeChange,
  onDraftChange,
  onSuggestionChange,
  onSuggest,
  onSend,
}: ConversationPanelProps) {
  const isHuman = conversation.handlingMode === 'human';
  return (
    <section
      className='flex h-full min-h-0 flex-col bg-card'
      aria-label={`Hội thoại với ${conversation.customer.name}`}
    >
      <header className='shrink-0 border-b border-primary-soft bg-card px-3 py-3 sm:px-4'>
        <div className='flex items-center gap-3'>
          <Button
            size='icon'
            variant='ghost'
            className='size-9 md:hidden'
            onClick={onBack}
            aria-label='Quay lại danh sách hội thoại'
          >
            <ArrowLeft className='size-4' aria-hidden />
          </Button>
          <ChannelAvatar
            initials={conversation.customer.initials}
            channel={conversation.channel}
            size='xs'
          />
          <div className='min-w-0 flex-1'>
            <h2 className='truncate text-sm font-extrabold text-foreground'>
              {conversation.customer.name}
            </h2>
            <p className='mt-0.5 truncate text-[11px] text-foreground-muted'>
              {CHANNEL_LABELS[conversation.channel]} · {conversation.accountName}
            </p>
          </div>
          <Button
            size='icon'
            variant='ghost'
            className={cn(
              'size-9',
              conversation.priority === 'urgent' ? 'text-amber-600' : 'text-foreground-muted',
            )}
            onClick={onTogglePriority}
            aria-label={conversation.priority === 'urgent'
              ? 'Bỏ đánh dấu ưu tiên'
              : 'Đánh dấu ưu tiên'}
          >
            <Star
              className='size-4'
              fill={conversation.priority === 'urgent' ? 'currentColor' : 'none'}
              aria-hidden
            />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='size-9 2xl:hidden'
            onClick={onOpenContext}
            aria-label='Mở thông tin khách hàng'
          >
            <Info className='size-4' aria-hidden />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='hidden size-9 sm:inline-flex'
            aria-label='Thêm hành động'
          >
            <Ellipsis className='size-4' aria-hidden />
          </Button>
        </div>
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          <span className='rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-foreground-muted'>
            {STATUS_LABELS[conversation.status]}
          </span>
          <span className='flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700'>
            <Bot className='size-3' aria-hidden />
            {HANDLING_MODE_LABELS[conversation.handlingMode]}
          </span>
          <span className='text-[10px] font-semibold text-foreground-muted'>
            Phụ trách: {conversation.assignee}
          </span>
          <span className='flex-1' />
          {isHuman
            ? (
              <Button size='sm' variant='outline' onClick={onReturnToAi}>
                <Bot className='size-3.5' aria-hidden />
                Trả lại AI
              </Button>
            )
            : (
              <Button size='sm' onClick={onTakeOver}>
                <UserRoundCheck className='size-3.5' aria-hidden />
                Tiếp quản
              </Button>
            )}
          <Button size='sm' variant='outline' onClick={onToggleResolved}>
            <CheckCircle2 className='size-3.5' aria-hidden />
            {conversation.status === 'resolved' ? 'Mở lại' : 'Hoàn tất'}
          </Button>
        </div>
      </header>

      <MessageTimeline conversation={conversation} />
      <ReplyComposer
        conversation={conversation}
        mode={mode}
        draft={draft}
        suggestion={suggestion}
        isSending={isSending}
        onModeChange={onModeChange}
        onDraftChange={onDraftChange}
        onSuggestionChange={onSuggestionChange}
        onSuggest={onSuggest}
        onSend={onSend}
      />
    </section>
  );
}
