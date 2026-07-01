import { type IRepository } from '@/core/interfaces';
import { type SubscriptionHistoryEntity } from '@/core/aggregate-roots';

export const SUBSCRIPTION_HISTORY_REPOSITORY = Symbol('SUBSCRIPTION_HISTORY_REPOSITORY');

export interface ISubscriptionHistoryRepository extends IRepository<SubscriptionHistoryEntity> {
	findBySubscriptionId(subscriptionId: string): Promise<SubscriptionHistoryEntity[]>;
	findByEnterpriseId(enterpriseId: string): Promise<SubscriptionHistoryEntity[]>;
}
