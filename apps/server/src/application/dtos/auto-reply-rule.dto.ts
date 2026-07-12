export class AutoReplyRuleDto {
  id: string;
  enterpriseId: string;
  socialPageId: string;
  name: string;
  isEnabled: boolean;
  keywords: string[];
  replyContent: string;
  createdAt: Date;
  updatedAt: Date;
}
