import type {
  CampaignObjective,
  CampaignParticipantRole,
  CampaignPermission,
  CreatorContactStatus,
  CreatorType,
  PlatformId,
  TonePreset,
} from '@/features/campaign-management/types';

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  facebook: 'Facebook',
  threads: 'Threads',
  instagram: 'Instagram',
};

export const OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  awareness: 'Nhận diện thương hiệu',
  engagement: 'Tăng tương tác',
  traffic: 'Kéo traffic',
  leads: 'Thu lead',
  sales: 'Bán hàng',
  creator_recruitment: 'Tuyển KOL/KOC',
};

export const TONE_LABELS: Record<TonePreset, string> = {
  friendly: 'Thân thiện',
  youthful: 'Trẻ trung',
  expert: 'Chuyên gia',
  luxury: 'Cao cấp',
  funny: 'Hài hước',
  inspiring: 'Truyền cảm hứng',
  custom: 'Tuỳ chỉnh',
};

export const CREATOR_TYPE_LABELS: Record<CreatorType, string> = {
  kol: 'KOL',
  koc: 'KOC',
  creator: 'Creator',
};

export const CONTACT_STATUS_LABELS: Record<CreatorContactStatus, string> = {
  not_contacted: 'Chưa liên hệ',
  invited: 'Đã gửi lời mời',
  discussing: 'Đang trao đổi',
  joined: 'Đã tham gia',
  rejected: 'Từ chối',
};

export const PARTICIPANT_ROLE_LABELS: Record<CampaignParticipantRole, string> = {
  owner: 'Owner',
  editor: 'Editor',
  reviewer: 'Reviewer',
  kol: 'KOL',
  koc: 'KOC',
  creator: 'Creator',
  affiliate: 'Affiliate',
  guest: 'Guest',
};

export const PERMISSION_LABELS: Record<CampaignPermission, string> = {
  view_brief: 'Xem brief',
  upload_media: 'Upload media',
  submit_draft: 'Gửi nội dung nháp',
  view_schedule: 'Xem lịch đăng',
  view_performance: 'Xem hiệu quả',
  manage_posts: 'Quản lý bài viết',
  manage_participants: 'Quản lý người tham gia',
};

export const PLATFORM_OPTIONS = Object.entries(PLATFORM_LABELS).map(
  ([id, label]) => ({ id: id as PlatformId, label }),
);

export const TONE_OPTIONS = Object.entries(TONE_LABELS).map(([id, label]) => ({
  id: id as TonePreset,
  label,
}));

export const OBJECTIVE_OPTIONS = Object.entries(OBJECTIVE_LABELS).map(
  ([id, label]) => ({ id: id as CampaignObjective, label }),
);
