import { ChannelAvatar } from '@/features/inbox/components/channel-avatar';
import {
  AI_STATE_LABELS,
  HANDLING_MODE_LABELS,
  STATUS_LABELS,
} from '@/features/inbox/components/inbox-labels';
import type { ConversationStatus, InboxConversation } from '@/features/inbox/types';
import { Bot, BriefcaseBusiness, MapPin, Tag, UserRound } from 'lucide-react';

type ConversationContextPanelProps = {
  conversation: InboxConversation;
  onAssigneeChange: (assignee: string) => void;
  onStatusChange: (status: ConversationStatus) => void;
};

function ContextSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='border-b border-primary-soft p-4 last:border-b-0'>
      <h3 className='flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-foreground-muted'>
        {icon}
        {title}
      </h3>
      <div className='mt-3'>{children}</div>
    </section>
  );
}

export function ConversationContextPanel({
  conversation,
  onAssigneeChange,
  onStatusChange,
}: ConversationContextPanelProps) {
  return (
    <div className='h-full overflow-y-auto bg-card'>
      <div className='border-b border-primary-soft p-5 text-center'>
        <ChannelAvatar
          initials={conversation.customer.initials}
          channel={conversation.channel}
          size='md'
          className='mx-auto'
        />
        <h2 className='mt-3 text-base font-extrabold text-foreground'>
          {conversation.customer.name}
        </h2>
        <p className='mt-0.5 text-xs text-foreground-muted'>@{conversation.customer.username}</p>
        <p className='mt-2 flex items-center justify-center gap-1 text-[11px] text-foreground-muted'>
          <MapPin className='size-3.5' aria-hidden />
          {conversation.customer.location}
        </p>
      </div>

      <ContextSection icon={<UserRound className='size-4' aria-hidden />} title='Phân loại'>
        <dl className='space-y-2 text-xs'>
          <div className='flex justify-between gap-3'>
            <dt className='text-foreground-muted'>Nhu cầu</dt>
            <dd className='text-right font-bold text-foreground'>{conversation.customer.intent}</dd>
          </div>
          <div className='flex justify-between gap-3'>
            <dt className='text-foreground-muted'>Giai đoạn</dt>
            <dd className='text-right font-bold text-foreground'>
              {conversation.customer.leadStage}
            </dd>
          </div>
        </dl>
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {conversation.tags.map((item) => (
            <span
              key={item}
              className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-bold text-foreground-muted'
            >
              <Tag className='size-3' aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </ContextSection>

      <ContextSection
        icon={<BriefcaseBusiness className='size-4' aria-hidden />}
        title='Ngữ cảnh kinh doanh'
      >
        <p className='text-xs font-bold leading-5 text-foreground'>{conversation.sourceContext}</p>
        <p className='mt-1 text-[11px] leading-5 text-foreground-muted'>
          Nguồn hội thoại giúp AI và đội ngũ giữ đúng bối cảnh tư vấn.
        </p>
      </ContextSection>

      <ContextSection icon={<Bot className='size-4' aria-hidden />} title='AI Agent'>
        <dl className='space-y-2 text-xs'>
          <div className='flex justify-between gap-3'>
            <dt className='text-foreground-muted'>Chế độ</dt>
            <dd className='text-right font-bold text-foreground'>
              {HANDLING_MODE_LABELS[conversation.handlingMode]}
            </dd>
          </div>
          <div className='flex justify-between gap-3'>
            <dt className='text-foreground-muted'>Trạng thái</dt>
            <dd className='text-right font-bold text-foreground'>
              {AI_STATE_LABELS[conversation.aiState]}
            </dd>
          </div>
        </dl>
        {conversation.handoffReason
          ? (
            <p className='mt-3 rounded-lg bg-amber-50 p-2.5 text-[11px] font-semibold leading-5 text-amber-800'>
              {conversation.handoffReason}
            </p>
          )
          : null}
        <button type='button' className='mt-3 text-xs font-bold text-blue-600 hover:underline'>
          Bổ sung vào kho tri thức
        </button>
      </ContextSection>

      <ContextSection icon={<UserRound className='size-4' aria-hidden />} title='Quản lý'>
        <label
          className='block text-[11px] font-bold text-foreground-muted'
          htmlFor='inbox-assignee'
        >
          Người phụ trách
        </label>
        <select
          id='inbox-assignee'
          value={conversation.assignee}
          onChange={(event) => onAssigneeChange(event.target.value)}
          className='mt-1.5 h-9 w-full rounded-lg border border-primary-soft bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30'
        >
          {['Chưa phân công', 'Anh Thư', 'Minh Khang', 'Nhóm tư vấn'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <label
          className='mt-3 block text-[11px] font-bold text-foreground-muted'
          htmlFor='inbox-status'
        >
          Trạng thái
        </label>
        <select
          id='inbox-status'
          value={conversation.status}
          onChange={(event) => onStatusChange(event.target.value as ConversationStatus)}
          className='mt-1.5 h-9 w-full rounded-lg border border-primary-soft bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-primary/30'
        >
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </ContextSection>
    </div>
  );
}
