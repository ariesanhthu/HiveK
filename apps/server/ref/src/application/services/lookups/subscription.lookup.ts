import { Injectable, Inject } from '@nestjs/common';
import { SUBSCRIPTION_REPOSITORY, type ISubscriptionRepository } from '@/core';
import { SubscriptionEntity } from '@/core';
import { IUnitOfWorkSession } from '@/core/interfaces';

@Injectable()
export class SubscriptionLookup {
	constructor(
		@Inject(SUBSCRIPTION_REPOSITORY)
		private readonly subscriptionRepository: ISubscriptionRepository
	) {}

	async findSubscription(
		id: string,
		session?: IUnitOfWorkSession
	): Promise<SubscriptionEntity | null> {
		const repo = session ? session.subscriptionRepository : this.subscriptionRepository;
		return repo.findById(id);
	}

	async findSubscriptions(
		ids: string[],
		session?: IUnitOfWorkSession
	): Promise<SubscriptionEntity[]> {
		if (!ids.length) return [];
		const repo = session ? session.subscriptionRepository : this.subscriptionRepository;
		return repo.findByIds(ids);
	}

	async findSubscriptionByEnterpriseId(
		enterpriseId: string,
		session?: IUnitOfWorkSession
	): Promise<SubscriptionEntity | null> {
		const repo = session ? session.subscriptionRepository : this.subscriptionRepository;
		return repo.findByEnterpriseId(enterpriseId);
	}

	async subscriptionExists(id: string, session?: IUnitOfWorkSession): Promise<boolean> {
		const repo = session ? session.subscriptionRepository : this.subscriptionRepository;
		return repo.exists(id);
	}
}
