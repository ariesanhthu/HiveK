import { IBaseRepository } from '../../common';
import { SocialPageRoot } from '../../aggregate-roots/social-page.aggregate';

export interface ISocialPageRepository extends IBaseRepository<SocialPageRoot> {
  findByPageId(
    platformCode: string,
    pageId: string,
  ): Promise<SocialPageRoot | null>;
  findByEnterpriseId(enterpriseId: string): Promise<SocialPageRoot[]>;
  findByWebhookVerifyToken(verifyToken: string): Promise<SocialPageRoot | null>;
}

export const SOCIAL_PAGE_REPOSITORY = Symbol('ISocialPageRepository');
