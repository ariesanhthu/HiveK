import { type IRepository } from '@/core/interfaces';
import { type SubscriptionEntity } from '@/core/aggregate-roots';

export const SUBSCRIPTION_REPOSITORY = Symbol('SUBSCRIPTION_REPOSITORY');

export interface ISubscriptionRepository extends IRepository<SubscriptionEntity> {
	findByEnterpriseId(enterpriseId: string): Promise<SubscriptionEntity | null>;
	existsByPackageId(packageId: string): Promise<boolean>;
	updateWithVersion(
		id: string,
		expectedVersion: number,
		entity: SubscriptionEntity
	): Promise<void>;
}
