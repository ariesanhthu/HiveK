import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionGetByIdQuery } from './subscription-get-by-id.query';
import { type ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { SubscriptionMapper } from '../../mappers';
import { SubscriptionResponseDTO } from '../../dtos';

@QueryHandler(SubscriptionGetByIdQuery)
export class SubscriptionGetByIdHandler implements IQueryHandler<SubscriptionGetByIdQuery> {
	constructor(
		@Inject(SUBSCRIPTION_REPOSITORY)
		private readonly subscriptionRepository: ISubscriptionRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: SubscriptionGetByIdQuery): Promise<SubscriptionResponseDTO> {
		const { dto } = query;
		this.loggerService.log(`Fetching subscription with ID: ${dto.id}`);

		const subscription = await this.subscriptionRepository.findById(dto.id);
		if (!subscription) {
			throw new Error(`Subscription with ID: ${dto.id} not found`);
		}

		this.loggerService.log(`Subscription with ID: ${dto.id} fetched successfully`);
		return SubscriptionMapper.toDto(subscription);
	}
}
