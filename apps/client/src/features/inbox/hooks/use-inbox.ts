'use client';

import { mockInboxAdapter } from '@/features/inbox/services/mock-inbox-adapter';
import type {
  ComposerMode,
  ConversationStatus,
  InboxConversation,
  InboxView,
} from '@/features/inbox/types';
import { useCallback, useEffect, useMemo, useState } from 'react';

type DraftStore = Record<string, Partial<Record<ComposerMode, string>>>;

const DRAFT_STORAGE_KEY = 'hivek.inbox-drafts.v1';

const VIEW_FILTERS: Record<InboxView, (item: InboxConversation) => boolean> = {
  needs_human: (item) => item.status === 'needs_human',
  mine: (item) => item.assignee === 'Anh Thư',
  unassigned: (item) => item.assignee === 'Chưa phân công',
  ai_active: (item) => item.aiState === 'active',
  waiting: (item) => item.status === 'waiting_for_customer',
  all: () => true,
  resolved: (item) => item.status === 'resolved',
};

function loadDrafts(): DraftStore {
  if (typeof window === 'undefined') return {};
  try {
    const saved = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as DraftStore) : {};
  } catch {
    return {};
  }
}

function makeClientMessageId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}`;
}

export function useInbox(initialConversationId?: string) {
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [selectedId, setSelectedId] = useState(initialConversationId ?? '');
  const [view, setView] = useState<InboxView>('needs_human');
  const [search, setSearch] = useState('');
  const [composerMode, setComposerMode] = useState<ComposerMode>('reply');
  const [drafts, setDrafts] = useState<DraftStore>(loadDrafts);
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await mockInboxAdapter.listConversations();
      setConversations(data);
      setSelectedId((current) => {
        if (current && data.some((item) => item.id === current)) return current;
        return data.find(VIEW_FILTERS.needs_human)?.id ?? data[0]?.id ?? '';
      });
    } catch {
      setError('Không thể tải hộp thư. Dữ liệu gần nhất vẫn được giữ lại nếu có.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (
      initialConversationId
      && conversations.some((item) => item.id === initialConversationId)
    ) {
      setSelectedId(initialConversationId);
    }
  }, [conversations, initialConversationId]);

  useEffect(() => {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(drafts));
  }, [drafts]);

  const filteredConversations = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('vi');
    return conversations.filter((item) => {
      if (!VIEW_FILTERS[view](item)) return false;
      if (!normalized) return true;
      const searchable = [
        item.customer.name,
        item.customer.username,
        item.preview,
        item.accountName,
        item.sourceContext,
        ...item.tags,
      ]
        .join(' ')
        .toLocaleLowerCase('vi');
      return searchable.includes(normalized);
    });
  }, [conversations, search, view]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId),
    [conversations, selectedId],
  );

  const counts = useMemo(
    () => ({
      needsHuman: conversations.filter(VIEW_FILTERS.needs_human).length,
      unread: conversations.filter((item) => item.unreadCount > 0).length,
    }),
    [conversations],
  );

  const updateConversation = useCallback(
    (conversationId: string, update: (item: InboxConversation) => InboxConversation) => {
      setConversations((current) =>
        current.map((item) => (item.id === conversationId ? update(item) : item))
      );
    },
    [],
  );

  const selectConversation = useCallback(
    (conversationId: string) => {
      setSelectedId(conversationId);
      setSuggestion('');
      updateConversation(conversationId, (item) => ({ ...item, unreadCount: 0 }));
    },
    [updateConversation],
  );

  const draft = selectedId ? drafts[selectedId]?.[composerMode] ?? '' : '';
  const setDraft = useCallback(
    (value: string) => {
      if (!selectedId) return;
      setDrafts((current) => ({
        ...current,
        [selectedId]: { ...current[selectedId], [composerMode]: value },
      }));
    },
    [composerMode, selectedId],
  );

  const appendSystemMessage = useCallback(
    (conversation: InboxConversation, content: string): InboxConversation => ({
      ...conversation,
      messages: [
        ...conversation.messages,
        {
          id: `system-${Date.now()}`,
          authorType: 'system',
          authorName: 'Hệ thống',
          content,
          createdAt: new Date().toISOString(),
          deliveryStatus: 'sent',
        },
      ],
    }),
    [],
  );

  const takeOver = useCallback(() => {
    if (!selectedId) return;
    updateConversation(selectedId, (item) =>
      appendSystemMessage(
        {
          ...item,
          assignee: 'Anh Thư',
          handlingMode: 'human',
          aiState: 'paused_by_user',
          status: 'open',
        },
        'Anh Thư đã tiếp quản. AI sẽ không tự gửi cho đến khi được bật lại.',
      ));
  }, [appendSystemMessage, selectedId, updateConversation]);

  const returnToAi = useCallback(() => {
    if (!selectedId) return;
    updateConversation(selectedId, (item) =>
      appendSystemMessage(
        { ...item, handlingMode: 'suggestion_only', aiState: 'suggestion_only' },
        'Hội thoại đã chuyển sang chế độ AI đề xuất để duyệt.',
      ));
  }, [appendSystemMessage, selectedId, updateConversation]);

  const toggleResolved = useCallback(() => {
    if (!selectedId) return;
    updateConversation(selectedId, (item) => ({
      ...item,
      status: item.status === 'resolved' ? 'open' : 'resolved',
    }));
  }, [selectedId, updateConversation]);

  const togglePriority = useCallback(() => {
    if (!selectedId) return;
    updateConversation(selectedId, (item) => ({
      ...item,
      priority: item.priority === 'urgent' ? 'normal' : 'urgent',
    }));
  }, [selectedId, updateConversation]);

  const setAssignee = useCallback(
    (assignee: string) => {
      if (!selectedId) return;
      updateConversation(selectedId, (item) => ({ ...item, assignee }));
    },
    [selectedId, updateConversation],
  );

  const setStatus = useCallback(
    (status: ConversationStatus) => {
      if (!selectedId) return;
      updateConversation(selectedId, (item) => ({ ...item, status }));
    },
    [selectedId, updateConversation],
  );

  const suggestReply = useCallback(() => {
    if (!selectedConversation) return;
    setSuggestion(
      selectedConversation.handoffReason
        ? 'Chào bạn, mình đã tiếp nhận yêu cầu và đang kiểm tra thông tin chính xác. Mình sẽ phản hồi bạn trong ít phút nữa nhé.'
        : 'Chào bạn, cảm ơn bạn đã quan tâm. Mình sẵn sàng hỗ trợ thêm thông tin để bạn chọn phương án phù hợp nhất nhé.',
    );
  }, [selectedConversation]);

  const sendMessage = useCallback(async () => {
    if (!selectedConversation || !draft.trim() || isSending) return;
    if (composerMode === 'reply' && !selectedConversation.capabilities.canSendText) return;

    const content = draft.trim();
    const clientMessageId = makeClientMessageId();
    const optimisticId = `optimistic-${clientMessageId}`;
    setIsSending(true);
    updateConversation(selectedConversation.id, (item) => ({
      ...item,
      preview: content,
      status: composerMode === 'reply' ? 'waiting_for_customer' : item.status,
      messages: [
        ...item.messages,
        {
          id: optimisticId,
          clientMessageId,
          authorType: composerMode === 'note' ? 'internal_note' : 'current_user',
          authorName: 'Anh Thư',
          content,
          createdAt: new Date().toISOString(),
          deliveryStatus: 'sending',
        },
      ],
    }));
    setDraft('');

    try {
      const sent = await mockInboxAdapter.sendMessage({
        conversationId: selectedConversation.id,
        content,
        mode: composerMode,
        clientMessageId,
      });
      updateConversation(selectedConversation.id, (item) => ({
        ...item,
        messages: item.messages.map((entry) => entry.id === optimisticId ? sent : entry),
      }));
    } catch {
      updateConversation(selectedConversation.id, (item) => ({
        ...item,
        messages: item.messages.map((entry) =>
          entry.id === optimisticId ? { ...entry, deliveryStatus: 'failed' } : entry
        ),
      }));
      setDraft(content);
    } finally {
      setIsSending(false);
    }
  }, [composerMode, draft, isSending, selectedConversation, setDraft, updateConversation]);

  return {
    conversations,
    filteredConversations,
    selectedConversation,
    selectedId,
    view,
    search,
    composerMode,
    draft,
    suggestion,
    counts,
    isLoading,
    isSending,
    error,
    setView,
    setSearch,
    setComposerMode,
    setDraft,
    setSuggestion,
    selectConversation,
    takeOver,
    returnToAi,
    toggleResolved,
    togglePriority,
    setAssignee,
    setStatus,
    suggestReply,
    sendMessage,
    retry: load,
  };
}
