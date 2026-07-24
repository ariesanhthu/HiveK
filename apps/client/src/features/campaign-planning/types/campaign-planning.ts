import type { LucideIcon } from 'lucide-react';

export type CampaignStatus = 'draft' | 'ready' | 'scheduled';
export type PostStatus = 'draft' | 'needs-review' | 'approved' | 'scheduled';
export type PlatformId = 'facebook' | 'threads' | 'tiktok';
export type CampaignDetailTab = 'content' | 'review' | 'schedule';

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  description: string;
};

export type SocialAccount = {
  id: string;
  platform: PlatformId;
  name: string;
};

export type CampaignPost = {
  id: string;
  day: number;
  dateLabel: string;
  time: string;
  title: string;
  goal: string;
  platform: PlatformId;
  accountId: string;
  content: string;
  firstComment: string;
  suggestedReplies: string[];
  mediaAsset?: string;
  mediaPrompt: string;
  status: PostStatus;
  reviewer: string;
  reviewNote: string;
  scheduledAt: string;
  hashtags: string[];
};

export type PublishingDay = {
  day: number;
  dateLabel: string;
  posts: CampaignPost[];
};

export type AgentStepStatus = 'done' | 'active' | 'queued';

export type AgentStep = {
  id: string;
  label: string;
  status: AgentStepStatus;
};

export type PlatformOption = {
  id: PlatformId;
  label: string;
  icon: LucideIcon;
};

export type CampaignPlanningData = {
  campaigns: Campaign[];
  accounts: SocialAccount[];
  posts: CampaignPost[];
  agentSteps: AgentStep[];
  agentProgress: number;
};
