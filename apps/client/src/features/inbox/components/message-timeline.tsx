import { formatInboxTime } from '@/features/inbox/components/inbox-labels';
import type { InboxConversation, InboxMessage } from '@/features/inbox/types';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Bot,
  CheckCheck,
  Info,
  StickyNote,
  UserRound,
  UserRoundCheck,
} from 'lucide-react';

const AUTHOR_LABELS: Record<InboxMessage['authorType'], string> = {
  customer: 'Khách hàng',
  ai_agent: 'AI Agent đã trả lời tự động',
  current_user: 'Bạn đã trả lời',
  workspace_member: 'Thành viên đã trả lời',
  internal_note: 'Ghi chú nội bộ · không gửi khách',
  system: 'Sự kiện hệ thống',
};

function MessageBubble({ message }: { message: InboxMessage; }) {
  if (message.authorType === 'system') {
    return (
      <li className='mx-auto flex max-w-xl items-center justify-center gap-2 py-2 text-center text-[11px] leading-5 text-foreground-muted'>
        <Info className='size-3.5 shrink-0' aria-hidden />
        <span>{message.content}</span>
      </li>
    );
  }

  const isCustomer = message.authorType === 'customer';
  const isNote = message.authorType === 'internal_note';
  const isAi = message.authorType === 'ai_agent';

  if (isNote) {
    return (
      <li className='mx-auto max-w-2xl rounded-xl border border-purple-200 bg-purple-50 p-3 text-sm text-purple-950'>
        <div className='flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-purple-700'>
          <StickyNote className='size-3.5' aria-hidden />
          {AUTHOR_LABELS[message.authorType]}
        </div>
        <p className='mt-2 leading-6'>{message.content}</p>
        <p className='mt-1 text-[10px] text-purple-600'>
          {message.authorName} · {formatInboxTime(message.createdAt)}
        </p>
      </li>
    );
  }

  return (
    <li className={cn('flex', isCustomer ? 'justify-start' : 'justify-end')}>
      <article
        className={cn(
          'max-w-[84%] rounded-2xl px-3.5 py-3 text-sm shadow-sm sm:max-w-[72%]',
          isCustomer
            ? 'rounded-bl-md border border-primary-soft bg-card text-foreground'
            : isAi
            ? 'rounded-br-md border border-amber-200 bg-amber-50 text-amber-950'
            : 'rounded-br-md bg-blue-600 text-white',
        )}
      >
        <div
          className={cn(
            'mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide',
            isCustomer ? 'text-foreground-muted' : isAi ? 'text-amber-700' : 'text-blue-100',
          )}
        >
          {isAi ? <Bot className='size-3.5' aria-hidden /> : null}
          {!isAi ? <UserRound className='size-3.5' aria-hidden /> : null}
          {AUTHOR_LABELS[message.authorType]}
        </div>
        <p className='whitespace-pre-wrap leading-6'>{message.content}</p>
        <div
          className={cn(
            'mt-1.5 flex items-center justify-end gap-1 text-[10px]',
            isCustomer ? 'text-foreground-muted' : isAi ? 'text-amber-700' : 'text-blue-100',
          )}
        >
          <span>{formatInboxTime(message.createdAt)}</span>
          {!isCustomer ? <CheckCheck className='size-3' aria-hidden /> : null}
          {message.deliveryStatus === 'sending' ? <span>Đang gửi</span> : null}
          {message.deliveryStatus === 'failed' ? <span role='alert'>Gửi thất bại</span> : null}
        </div>
        {message.evidence?.length
          ? (
            <details className='mt-2 border-t border-amber-200 pt-2 text-xs text-amber-900'>
              <summary className='cursor-pointer font-bold'>Cơ sở trả lời</summary>
              <ul className='mt-1.5 space-y-1 pl-4'>
                {message.evidence.map((item) => <li key={item} className='list-disc'>{item}</li>)}
              </ul>
              <p className='mt-1.5'>
                Độ tin cậy: {message.confidence === 'high' ? 'Cao' : 'Trung bình'}
              </p>
            </details>
          )
          : null}
      </article>
    </li>
  );
}

export function MessageTimeline({ conversation }: { conversation: InboxConversation; }) {
  return (
    <div className='min-h-0 flex-1 overflow-y-auto bg-background-light px-4 py-5 sm:px-6'>
      {conversation.handoffReason
        ? (
          <section
            className='mx-auto mb-5 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-4'
            aria-label='Yêu cầu chuyển người thật'
          >
            <div className='flex items-start gap-3'>
              <span className='rounded-lg bg-amber-100 p-2 text-amber-700'>
                <AlertTriangle className='size-4' aria-hidden />
              </span>
              <div className='min-w-0'>
                <h3 className='flex items-center gap-1.5 text-sm font-extrabold text-amber-950'>
                  <UserRoundCheck className='size-4' aria-hidden />
                  Cần người thật xử lý
                </h3>
                <p className='mt-1 text-xs leading-5 text-amber-800'>
                  {conversation.handoffReason}
                </p>
                <p className='mt-2 text-[11px] font-semibold text-amber-700'>
                  AI đã dừng gửi tự động để tránh trả lời sai hoặc vượt chính sách.
                </p>
              </div>
            </div>
          </section>
        )
        : null}

      <ol
        className='mx-auto max-w-3xl space-y-3'
        role='log'
        aria-live='polite'
        aria-label={`Tin nhắn với ${conversation.customer.name}`}
      >
        <li className='flex items-center gap-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted'>
          <span className='h-px flex-1 bg-primary-soft' />
          Hôm nay
          <span className='h-px flex-1 bg-primary-soft' />
        </li>
        {conversation.messages.map((item) => <MessageBubble key={item.id} message={item} />)}
      </ol>
    </div>
  );
}
