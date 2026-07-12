export class SocialPageDto {
  id: string;
  enterpriseId: string;
  platformId: string;
  platformCode: string;
  pageId: string;
  pageName: string;
  pictureUrl: string | null;
  followerCount: number | null;
  webhookVerifyToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
