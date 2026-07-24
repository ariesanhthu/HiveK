export type InboxChannel = 'messenger' | 'instagram' | 'threads';
export type ConversationStatus =
  | 'open'
  | 'needs_human'
  | 'waiting_for_customer'
  | 'snoozed'
  | 'resolved';
export type ConversationPriority = 'normal' | 'high' | 'urgent';
export type HandlingMode = 'limited_auto' | 'suggestion_only' | 'human';
export type AiState =
  | 'active'
  | 'suggestion_only'
  | 'paused_by_user'
  | 'blocked_missing_data'
  | 'blocked_conflict'
  | 'handoff_requested';
export type MessageAuthor =
  | 'customer'
  | 'ai_agent'
  | 'current_user'
  | 'workspace_member'
  | 'internal_note'
  | 'system';

export type ChannelCapabilities = {
  canSendText: boolean;
  canSendAttachments: boolean;
  canOpenNativeConversation: boolean;
  canUseAutomation: boolean;
  permissionStatus: 'active' | 'read_only' | 'expired';
  replyWindowExpiresAt?: string;
  policyNotice?: string;
};

export type InboxMessage = {
  id: string;
  clientMessageId?: string;
  authorType: MessageAuthor;
  authorName: string;
  content: string;
  createdAt: string;
  deliveryStatus: 'sent' | 'delivered' | 'sending' | 'failed';
  isAutomated?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  evidence?: string[];
};

export type InboxCustomer = {
  name: string;
  initials: string;
  username: string;
  location: string;
  intent: string;
  leadStage: string;
};

export type InboxConversation = {
  id: string;
  customer: InboxCustomer;
  channel: InboxChannel;
  accountName: string;
  status: ConversationStatus;
  priority: ConversationPriority;
  unreadCount: number;
  lastMessageAt: string;
  assignee: string;
  handlingMode: HandlingMode;
  aiState: AiState;
  tags: string[];
  preview: string;
  sourceContext: string;
  capabilities: ChannelCapabilities;
  messages: InboxMessage[];
  handoffReason?: string;
};

export type InboxView =
  | 'needs_human'
  | 'mine'
  | 'unassigned'
  | 'ai_active'
  | 'waiting'
  | 'all'
  | 'resolved';

export type ComposerMode = 'reply' | 'note';

export type SendMessageInput = {
  conversationId: string;
  content: string;
  mode: ComposerMode;
  clientMessageId: string;
};

export type InboxAdapter = {
  listConversations: () => Promise<InboxConversation[]>;
  sendMessage: (input: SendMessageInput) => Promise<InboxMessage>;
};
