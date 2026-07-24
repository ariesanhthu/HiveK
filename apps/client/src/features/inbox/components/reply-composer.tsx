import { Button } from '@/components/ui/button';
import { CHANNEL_LABELS } from '@/features/inbox/components/inbox-labels';
import type { ComposerMode, InboxConversation } from '@/features/inbox/types';
import { cn } from '@/lib/utils';
import { Bot, Paperclip, Send, StickyNote } from 'lucide-react';

type ReplyComposerProps = {
  conversation: InboxConversation;
  mode: ComposerMode;
  draft: string;
  suggestion: string;
  isSending: boolean;
  onModeChange: (mode: ComposerMode) => void;
  onDraftChange: (value: string) => void;
  onSuggestionChange: (value: string) => void;
  onSuggest: () => void;
  onSend: () => void;
};

export function ReplyComposer({
  conversation,
  mode,
  draft,
  suggestion,
  isSending,
  onModeChange,
  onDraftChange,
  onSuggestionChange,
  onSuggest,
  onSend,
}: ReplyComposerProps) {
  const isReply = mode === 'reply';
  const requiresTakeover = isReply && conversation.handlingMode !== 'human';
  const cannotSend = isReply && !conversation.capabilities.canSendText;
  const isDisabled = cannotSend || requiresTakeover;
  const notice = cannotSend
    ? conversation.capabilities.policyNotice ?? 'Kênh hiện không cho phép gửi tin nhắn.'
    : requiresTakeover
    ? 'Tiếp quản hội thoại trước khi trả lời để tránh AI và người thật gửi đồng thời.'
    : '';

  return (
    <section className='shrink-0 border-t border-primary-soft bg-card px-3 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5'>
      {suggestion
        ? (
          <div className='mx-auto mb-3 max-w-3xl rounded-xl border border-blue-200 bg-blue-50 p-3'>
            <div className='flex items-center gap-2 text-xs font-extrabold text-blue-800'>
              <Bot className='size-4' aria-hidden />
              AI đề xuất · chưa gửi
            </div>
            <p className='mt-1.5 text-xs leading-5 text-blue-950'>{suggestion}</p>
            <div className='mt-2 flex gap-2'>
              <Button
                size='sm'
                onClick={() => {
                  onDraftChange(draft ? `${draft}\n\n${suggestion}` : suggestion);
                  onSuggestionChange('');
                }}
              >
                Chèn vào câu trả lời
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => onSuggestionChange('')}
              >
                Bỏ qua
              </Button>
            </div>
          </div>
        )
        : null}

      <div className='mx-auto max-w-3xl overflow-hidden rounded-xl border border-primary-soft bg-background-light focus-within:ring-2 focus-within:ring-primary/30'>
        <div className='flex items-center gap-1 border-b border-primary-soft px-2 py-1.5'>
          <button
            type='button'
            onClick={() => onModeChange('reply')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-bold',
              isReply ? 'bg-card text-foreground shadow-sm' : 'text-foreground-muted',
            )}
          >
            Trả lời khách
          </button>
          <button
            type='button'
            onClick={() => onModeChange('note')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold',
              !isReply ? 'bg-purple-100 text-purple-800' : 'text-foreground-muted',
            )}
          >
            <StickyNote className='size-3.5' aria-hidden />
            Ghi chú nội bộ
          </button>
        </div>
        {!isReply
          ? (
            <p className='bg-purple-50 px-3 py-1.5 text-[11px] font-bold text-purple-700'>
              Ghi chú nội bộ — nội dung này không được gửi cho khách.
            </p>
          )
          : null}
        <textarea
          rows={2}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          disabled={isDisabled}
          placeholder={isDisabled
            ? 'Chưa thể trả lời trong trạng thái hiện tại'
            : isReply
            ? `Nhắn qua ${CHANNEL_LABELS[conversation.channel]}...`
            : 'Thêm ghi chú cho nhóm...'}
          className='max-h-32 min-h-16 w-full resize-y bg-transparent px-3 py-2.5 text-sm leading-6 text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-60'
          aria-label={isReply ? 'Nội dung trả lời khách' : 'Nội dung ghi chú nội bộ'}
        />
        <div className='flex items-center justify-between gap-2 px-2 pb-2'>
          <div className='flex items-center gap-1'>
            <Button
              size='icon'
              variant='ghost'
              className='size-8'
              disabled={!conversation.capabilities.canSendAttachments || !isReply}
              aria-label='Đính kèm tệp'
            >
              <Paperclip className='size-4' aria-hidden />
            </Button>
            <Button size='sm' variant='ghost' onClick={onSuggest}>
              <Bot className='size-4' aria-hidden />
              Gợi ý trả lời
            </Button>
          </div>
          <Button
            size='sm'
            onClick={onSend}
            disabled={isDisabled || !draft.trim() || isSending}
            aria-label={isReply ? 'Gửi tin nhắn' : 'Lưu ghi chú nội bộ'}
          >
            {isSending ? 'Đang gửi' : isReply ? 'Gửi' : 'Lưu ghi chú'}
            <Send className='size-3.5' aria-hidden />
          </Button>
        </div>
      </div>
      <div className='mx-auto mt-2 flex max-w-3xl items-start justify-between gap-3 text-[10px] text-foreground-muted'>
        <p
          className={cn('leading-4', notice ? 'font-semibold text-amber-700' : undefined)}
          role={notice ? 'status' : undefined}
        >
          {notice || `Đang gửi từ ${conversation.accountName}`}
        </p>
        {conversation.capabilities.replyWindowExpiresAt && !cannotSend
          ? <p className='shrink-0'>Cửa sổ trả lời đang mở</p>
          : null}
      </div>
    </section>
  );
}
