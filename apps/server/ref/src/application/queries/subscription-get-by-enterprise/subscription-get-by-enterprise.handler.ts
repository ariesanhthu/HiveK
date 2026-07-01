import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionGetByEnterpriseQuery } from './subscription-get-by-enterprise.query';
import { type ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { SubscriptionResponseDTO } from '../../dtos';
import { SubscriptionMapper } from '../../mappers';

@QueryHandler(SubscriptionGetByEnterpriseQuery)
export class SubscriptionGetByEnterpriseHandler implements IQueryHandler<SubscriptionGetByEnterpriseQuery> {
	constructor(
		@Inject(SUBSCRIPTION_REPOSITORY)
		private readonly subscriptionRepository: ISubscriptionRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: SubscriptionGetByEnterpriseQuery): Promise<SubscriptionResponseDTO> {
		const { dto } = query;
		this.loggerService.log(`Fetching subscription with Enterprise ID: ${dto.enterpriseId}`);

		const subscription = await this.subscriptionRepository.findByEnterpriseId(dto.enterpriseId);
		if (!subscription) {
			throw new Error(`Subscription with Enterprise ID: ${dto.enterpriseId} not found`);
		}

		this.loggerService.log(
			`Subscription with Enterprise ID: ${dto.enterpriseId} fetched successfully`
		);
		return SubscriptionMapper.toDto(subscription);
	}
}
