import { EPostStatus } from '@/core/enums/post-status.enum';

export class ScheduledPostDto {
  id: string;
  enterpriseId: string;
  socialPageId: string;
  platformCode: string;
  content: string;
  mediaFileIds: string[];
  scheduledAt: Date;
  status: EPostStatus;
  publishedAt: Date | null;
  platformPostId: string | null;
  failReason: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
