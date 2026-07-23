import { ChannelAvatar } from '@/features/inbox/components/channel-avatar';
import {
  AI_STATE_LABELS,
  CHANNEL_LABELS,
  formatInboxTime,
  VIEW_OPTIONS,
} from '@/features/inbox/components/inbox-labels';
import type { InboxConversation, InboxView } from '@/features/inbox/types';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

type ConversationListPanelProps = {
  conversations: InboxConversation[];
  selectedId: string;
  view: InboxView;
  search: string;
  isLoading: boolean;
  onViewChange: (view: InboxView) => void;
  onSearchChange: (value: string) => void;
  onSelect: (conversationId: string) => void;
};

function ConversationItem({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: InboxConversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const needsAttention = conversation.status === 'needs_human' || conversation.unreadCount > 0;
  return (
    <button
      type='button'
      onClick={onSelect}
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'w-full border-b border-primary-soft px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        isSelected ? 'bg-primary-soft' : 'bg-card hover:bg-muted/60',
      )}
    >
      <div className='flex gap-3'>
        <ChannelAvatar
          initials={conversation.customer.initials}
          channel={conversation.channel}
        />
        <span className='min-w-0 flex-1'>
          <span className='flex items-start gap-2'>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm text-foreground',
                needsAttention ? 'font-extrabold' : 'font-semibold',
              )}
            >
              {conversation.customer.name}
            </span>
            <span className='shrink-0 text-[11px] text-foreground-muted'>
              {formatInboxTime(conversation.lastMessageAt)}
            </span>
          </span>
          <span className='mt-1 block truncate text-xs leading-5 text-foreground-muted'>
            {conversation.preview}
          </span>
          <span className='mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-foreground-muted'>
            <span className='truncate'>
              {CHANNEL_LABELS[conversation.channel]} · {conversation.accountName}
            </span>
          </span>
          <span className='mt-2 flex flex-wrap items-center gap-1.5'>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-bold',
                conversation.status === 'needs_human'
                  ? 'bg-amber-100 text-amber-800'
                  : conversation.aiState === 'active'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-muted text-foreground-muted',
              )}
            >
              {AI_STATE_LABELS[conversation.aiState]}
            </span>
            {conversation.unreadCount > 0
              ? (
                <span
                  className='inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-extrabold text-background-dark'
                  aria-label={`${conversation.unreadCount} tin chưa đọc`}
                >
                  {conversation.unreadCount}
                </span>
              )
              : null}
            {conversation.priority !== 'normal'
              ? <span className='text-[10px] font-bold text-rose-600'>Ưu tiên cao</span>
              : null}
          </span>
        </span>
      </div>
    </button>
  );
}

export function ConversationListPanel({
  conversations,
  selectedId,
  view,
  search,
  isLoading,
  onViewChange,
  onSearchChange,
  onSelect,
}: ConversationListPanelProps) {
  return (
    <section className='flex h-full min-h-0 flex-col bg-card' aria-label='Danh sách hội thoại'>
      <div className='shrink-0 border-b border-primary-soft p-3'>
        <div className='flex items-center gap-2 rounded-xl border border-primary-soft bg-background-light px-3 py-2'>
          <Search className='size-4 shrink-0 text-foreground-muted' aria-hidden />
          <input
            type='search'
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder='Tìm khách hoặc nội dung...'
            className='min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted'
            aria-label='Tìm kiếm hội thoại'
          />
        </div>
        <div className='mt-3 flex gap-2 overflow-x-auto pb-1' aria-label='Chế độ xem hộp thư'>
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.id}
              type='button'
              onClick={() => onViewChange(option.id)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors',
                view === option.id
                  ? 'bg-foreground text-card'
                  : 'bg-muted text-foreground-muted hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto [content-visibility:auto]'>
        {isLoading
          ? (
            <div className='space-y-px' aria-label='Đang tải hội thoại'>
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className='flex animate-pulse gap-3 border-b border-primary-soft p-4'
                >
                  <span className='size-10 rounded-full bg-muted' />
                  <span className='flex-1 space-y-2'>
                    <span className='block h-3 w-1/2 rounded bg-muted' />
                    <span className='block h-3 w-full rounded bg-muted' />
                    <span className='block h-3 w-2/3 rounded bg-muted' />
                  </span>
                </div>
              ))}
            </div>
          )
          : conversations.length
          ? (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                onSelect={() => onSelect(conversation.id)}
              />
            ))
          )
          : (
            <div className='flex h-full items-center justify-center p-6 text-center'>
              <div>
                <p className='text-sm font-extrabold text-foreground'>Không có hội thoại phù hợp</p>
                <p className='mt-1 text-xs leading-5 text-foreground-muted'>
                  Thử đổi chế độ xem hoặc xóa từ khóa tìm kiếm.
                </p>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
