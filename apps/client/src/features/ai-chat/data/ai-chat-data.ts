import type {
  AiChatSetup,
  BrandToneOption,
  SocialPlatformOption,
  StarterPrompt,
} from '@/features/ai-chat/types';

export const STARTER_PROMPTS = [
  {
    id: 'quick-start',
    label: 'Bắt đầu nhanh',
    description: 'Thiết lập các dữ liệu nền tảng để trợ lý hiểu thương hiệu của bạn.',
    icon: 'rocket',
  },
  {
    id: 'plan-posts',
    label: 'Lên kế hoạch đăng bài',
    description: 'Tạo lịch nội dung rõ ràng cho tuần hoặc chiến dịch tiếp theo.',
    icon: 'calendar',
  },
  {
    id: 'campaign-ideas',
    label: 'Gợi ý ý tưởng chiến dịch',
    description: 'Khơi mở concept, thông điệp và hướng triển khai phù hợp.',
    icon: 'megaphone',
  },
  {
    id: 'find-creators',
    label: 'Tìm KOL/KOC phù hợp',
    description: 'Xác định nhóm nhà sáng tạo phù hợp với mục tiêu thương hiệu.',
    icon: 'users',
  },
  {
    id: 'analyze-content',
    label: 'Phân tích nội dung',
    description: 'Đánh giá nội dung và tìm cơ hội cải thiện hiệu quả truyền thông.',
    icon: 'chart',
  },
] as const satisfies readonly StarterPrompt[];

export const SOCIAL_PLATFORM_OPTIONS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'threads', label: 'Threads' },
] as const satisfies readonly SocialPlatformOption[];

export const BRAND_TONE_OPTIONS = [
  {
    id: 'professional',
    label: 'Chuyên nghiệp',
    description: 'Rõ ràng, đáng tin cậy và tập trung vào chuyên môn.',
  },
  {
    id: 'friendly',
    label: 'Thân thiện',
    description: 'Gần gũi, tự nhiên và dễ bắt đầu cuộc trò chuyện.',
  },
  {
    id: 'inspiring',
    label: 'Truyền cảm hứng',
    description: 'Tích cực, giàu năng lượng và hướng đến hành động.',
  },
  {
    id: 'playful',
    label: 'Trẻ trung',
    description: 'Vui vẻ, linh hoạt và bắt nhịp xu hướng.',
  },
] as const satisfies readonly BrandToneOption[];

export const INITIAL_AI_CHAT_SETUP: Readonly<AiChatSetup> = {
  socialPlatforms: [],
  branding: {
    name: '',
    tone: null,
  },
  driveUrl: '',
};
