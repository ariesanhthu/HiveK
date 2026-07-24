export type PlatformId = 'facebook' | 'threads' | 'instagram';

export type CampaignStatus =
  | 'draft'
  | 'generating'
  | 'reviewing'
  | 'scheduled'
  | 'published'
  | 'archived';

export type CampaignObjective =
  | 'awareness'
  | 'engagement'
  | 'traffic'
  | 'leads'
  | 'sales'
  | 'creator_recruitment';

export type TonePreset =
  | 'friendly'
  | 'youthful'
  | 'expert'
  | 'luxury'
  | 'funny'
  | 'inspiring'
  | 'custom';

export type CampaignPermission =
  | 'view_brief'
  | 'upload_media'
  | 'submit_draft'
  | 'view_schedule'
  | 'view_performance'
  | 'manage_posts'
  | 'manage_participants';

export type CreatorType = 'kol' | 'koc' | 'creator';

export type CreatorContactStatus =
  | 'not_contacted'
  | 'invited'
  | 'discussing'
  | 'joined'
  | 'rejected';

export type CampaignParticipantRole =
  | 'owner'
  | 'editor'
  | 'reviewer'
  | 'kol'
  | 'koc'
  | 'creator'
  | 'affiliate'
  | 'guest';

export type CampaignParticipantStatus =
  | 'invited'
  | 'joined'
  | 'discussing'
  | 'pending_review'
  | 'rejected'
  | 'removed';

export type CampaignDetailTab =
  | 'config'
  | 'content'
  | 'tracking'
  | 'roadmap'
  | 'review'
  | 'schedule'
  | 'creators'
  | 'participants';

export type CampaignPostStatus = 'draft' | 'needs-review' | 'approved' | 'scheduled';

export type CampaignPostNode = {
  id: string;
  title: string;
  platform: PlatformId;
  contentType: 'caption' | 'carousel' | 'reels' | 'thread' | 'album' | 'story';
  status: CampaignPostStatus;
  time: string;
  owner: string;
  angle: string;
};

export type CampaignPostingDay = {
  day: number;
  dateLabel: string;
  posts: CampaignPostNode[];
};

export type CampaignTrackingMetric = {
  impressions: number;
  reach: number;
  engagementRate: number;
  clicks: number;
  comments: number;
  leads: number;
  conversionRate: number;
  spend: number;
  revenue: number;
};

export type CampaignToneConfig = {
  preset: TonePreset;
  customDescription?: string;
  formality: 1 | 2 | 3 | 4 | 5;
  emojiLevel: 'none' | 'low' | 'medium' | 'high';
  language: 'vi' | 'en' | 'vi-en';
  perspective: 'brand' | 'founder' | 'creator';
  requiredKeywords: string[];
  bannedKeywords: string[];
  suggestedHashtags: string[];
};

export type CampaignMedia = {
  id: string;
  type: 'image' | 'video' | 'document' | 'logo';
  url: string;
  name: string;
  role: 'brand' | 'product' | 'lifestyle' | 'reference' | 'generated';
  alt?: string;
};

export type CampaignPlatformContent = {
  platform: PlatformId;
  postingStyle: string;
  primaryFormat: string;
  caption: string;
  contentAngle: string;
  mediaDirection: string;
  hashtags: string[];
};

export type CampaignCommentReplyExample = {
  id: string;
  question: string;
  answer: string;
  intent: 'pricing' | 'size' | 'shipping' | 'material' | 'styling' | 'general';
};

export type CampaignAiConfig = {
  numberOfPosts: number;
  variantsPerPost: number;
  creativity: 1 | 2 | 3 | 4 | 5;
  contentStrategies: Array<
    | 'awareness'
    | 'education'
    | 'storytelling'
    | 'testimonial'
    | 'comparison'
    | 'sales'
    | 'ugc'
    | 'reminder'
  >;
  generateCaption: boolean;
  generateHashtags: boolean;
  generateCta: boolean;
  generateMediaPrompt: boolean;
  generateSchedule: boolean;
  suggestCreators: boolean;
  approvalMode: 'per_post' | 'approve_all' | 'auto_schedule_after_approval';
};

export type CampaignInviteConfig = {
  enabled: boolean;
  defaultCode: string;
  inviteLink: string;
  expiresAt?: string;
  maxParticipants?: number;
  permissions: CampaignPermission[];
};

export type CampaignBrief = {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  platforms: PlatformId[];
  accountIds: string[];
  productIds: string[];
  description: string;
  keyMessage: string;
  targetAudience: string;
  customerInsight?: string;
  usp?: string;
  offer?: string;
  cta: string;
  landingUrl?: string;
  productName?: string;
  tone: CampaignToneConfig;
  media: CampaignMedia[];
  platformContent: CampaignPlatformContent[];
  commentReplyExamples: CampaignCommentReplyExample[];
  postingPlan: CampaignPostingDay[];
  tracking: CampaignTrackingMetric;
  aiConfig: CampaignAiConfig;
  invite: CampaignInviteConfig;
  createdAt: string;
  updatedAt: string;
};

export type CampaignCreatorSuggestion = {
  id: string;
  name: string;
  avatarUrl?: string;
  type: CreatorType;
  platforms: PlatformId[];
  niche: string[];
  followerRange: string;
  engagementRate?: number;
  audienceMatchScore: number;
  estimatedCost?: string;
  reason: string[];
  contactStatus: CreatorContactStatus;
  contactInfo?: {
    email?: string;
    phone?: string;
    facebook?: string;
    instagram?: string;
    zalo?: string;
  };
};

export type CampaignParticipant = {
  id: string;
  campaignId: string;
  name: string;
  avatarUrl?: string;
  role: CampaignParticipantRole;
  status: CampaignParticipantStatus;
  contactChannel?: 'email' | 'zalo' | 'facebook' | 'instagram' | 'phone';
  contactValue?: string;
  inviteCode: string;
  inviteLink: string;
  permissions: CampaignPermission[];
  creatorSuggestionId?: string;
  notes?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CampaignFormInput = {
  name: string;
  objective: CampaignObjective;
  platforms: PlatformId[];
  productName: string;
  cta: string;
  landingUrl: string;
  description: string;
  keyMessage: string;
  targetAudience: string;
  customerInsight: string;
  usp: string;
  offer: string;
  tonePreset: TonePreset;
  formality: 1 | 2 | 3 | 4 | 5;
  emojiLevel: CampaignToneConfig['emojiLevel'];
  language: CampaignToneConfig['language'];
  perspective: CampaignToneConfig['perspective'];
  requiredKeywords: string;
  bannedKeywords: string;
  suggestedHashtags: string;
  numberOfPosts: number;
  variantsPerPost: number;
  creativity: 1 | 2 | 3 | 4 | 5;
  approvalMode: CampaignAiConfig['approvalMode'];
  inviteEnabled: boolean;
  inviteCode: string;
};
