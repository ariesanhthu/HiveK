import { IBaseRepository } from '../../common';
import { SubscriptionEntity } from '../../aggregate-roots/subscription.aggregate';

export interface ISubscriptionRepository extends IBaseRepository<SubscriptionEntity> {
  findByEnterpriseId(enterpriseId: string): Promise<SubscriptionEntity | null>;
  existsByPackageId(packageId: string): Promise<boolean>;
  updateWithVersion(
    id: string,
    expectedVersion: number,
    entity: SubscriptionEntity
  ): Promise<void>;
}

export const SUBSCRIPTION_REPOSITORY = Symbol('ISubscriptionRepository');
