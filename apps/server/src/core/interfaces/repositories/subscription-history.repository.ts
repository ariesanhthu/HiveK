import { IBaseRepository } from '../../common';
import { SubscriptionHistoryEntity } from '../../aggregate-roots/subscription-history.aggregate';

export interface ISubscriptionHistoryRepository extends IBaseRepository<SubscriptionHistoryEntity> {
  findBySubscriptionId(subscriptionId: string): Promise<SubscriptionHistoryEntity[]>;
  findByEnterpriseId(enterpriseId: string): Promise<SubscriptionHistoryEntity[]>;
}

export const SUBSCRIPTION_HISTORY_REPOSITORY = Symbol('ISubscriptionHistoryRepository');
