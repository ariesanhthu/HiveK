```ts
export interface CampaignSchedule {
  campaignId: string;
  timeline: ScheduleDay[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleDay {
  date: Date;
  label?: string;
  posts: SchedulePost[];
}

export interface SchedulePost {
  scheduledTime: Date;
  platformId: string;
  status: SchedulePostStatus;
  campaignKOLOutputs: CampaignKOLOutput[];
  campaignEnterpriseOutputs: CampaignEnterpriseOutput[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CampaignEnterpriseOutput {
  platformId: string;
  uniqueId?: string;
  outputType: EOutputType;
  title: string;
  isScheduleForPost: boolean;
  scheduledAt: Nullable<Date>;
  fileId: Nullable<string>;
  status: EOutputStatus;
  url: Nullable<string>;
  postedAt: Nullable<Date>;
  isTrackingActive: boolean;
}

export interface CampaignKOLOutput {
  kolProfileId: string;
  platformId: string;
  uniqueId?: string;
  outputType: EOutputType;
  title: string;
  isScheduleForPost: boolean;
  scheduledAt: Nullable<Date>;
  fileId: Nullable<string>;
  status: EOutputStatus;
  url: Nullable<string>;
  postedAt: Nullable<Date>;
  isTrackingActive: boolean;
}

export enum EOutputType {
  VIDEO = 'video',
  SHORT_VIDEO = 'short_video',
  POST = 'post',
  BLOG = 'blog',
}

export enum SchedulePostStatus {
  DRAFT = 'draft',
  APPROVED = 'approved',
  NEEDS_REVIEW = 'needs_review',
  REJECTED = 'rejected',
}

```