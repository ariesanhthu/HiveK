import { IBaseRepository } from '../../common';
import { SubscriptionRoot } from '../../aggregate-roots/subscription.aggregate';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionRoot> {
  findByUserId(userId: string): Promise<SubscriptionRoot | null>;
  existsByPackageId(packageId: string): Promise<boolean>;
  findExpiredSubscriptions(now: Date): Promise<SubscriptionRoot[]>;
  updateWithVersion(
    id: string,
    expectedVersion: number,
    entity: SubscriptionRoot,
  ): Promise<void>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('ISubscriptionRepository');
