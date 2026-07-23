import type {
  AiState,
  ConversationStatus,
  HandlingMode,
  InboxChannel,
  InboxView,
} from '@/features/inbox/types';

export const VIEW_OPTIONS: { id: InboxView; label: string; }[] = [
  { id: 'needs_human', label: 'Cần xử lý' },
  { id: 'mine', label: 'Của tôi' },
  { id: 'unassigned', label: 'Chưa phân công' },
  { id: 'ai_active', label: 'AI đang xử lý' },
  { id: 'waiting', label: 'Chờ khách' },
  { id: 'all', label: 'Tất cả' },
  { id: 'resolved', label: 'Đã hoàn tất' },
];

export const STATUS_LABELS: Record<ConversationStatus, string> = {
  open: 'Đang xử lý',
  needs_human: 'Cần người thật',
  waiting_for_customer: 'Đang chờ khách',
  snoozed: 'Tạm hoãn',
  resolved: 'Đã giải quyết',
};

export const AI_STATE_LABELS: Record<AiState, string> = {
  active: 'AI đang xử lý',
  suggestion_only: 'AI chỉ gợi ý',
  paused_by_user: 'AI đã tạm dừng',
  blocked_missing_data: 'AI thiếu dữ liệu',
  blocked_conflict: 'Dữ liệu mâu thuẫn',
  handoff_requested: 'Cần bạn xử lý',
};

export const HANDLING_MODE_LABELS: Record<HandlingMode, string> = {
  limited_auto: 'Tự động có giới hạn',
  suggestion_only: 'AI đề xuất để duyệt',
  human: 'Người trực tiếp',
};

export const CHANNEL_LABELS: Record<InboxChannel, string> = {
  messenger: 'Messenger',
  instagram: 'Instagram Direct',
  threads: 'Threads · chỉ đọc',
};

export function formatInboxTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
