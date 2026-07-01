import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionGetHistoryByIdQuery } from './subscription-get-history-by-id.query';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { type ISubscriptionHistoryRepository, SUBSCRIPTION_HISTORY_REPOSITORY } from '@/core';
import { SubscriptionHistoryResponseDTO } from '../../dtos/subscription-history-response.dto';
import { SubscriptionMapper } from '../../mappers';

@QueryHandler(SubscriptionGetHistoryByIdQuery)
export class SubscriptionGetHistoryByIdHandler implements IQueryHandler<SubscriptionGetHistoryByIdQuery> {
	constructor(
		@Inject(SUBSCRIPTION_HISTORY_REPOSITORY)
		private readonly subscriptionHistoryRepository: ISubscriptionHistoryRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: SubscriptionGetHistoryByIdQuery): Promise<SubscriptionHistoryResponseDTO> {
		const { dto } = query;
		this.loggerService.log(`Fetching subscription history with ID: ${dto.id}`);

		const subscriptionHistory = await this.subscriptionHistoryRepository.findById(dto.id);
		if (!subscriptionHistory) {
			throw new Error(`Subscription history with ID: ${dto.id} not found`);
		}

		this.loggerService.log(`Subscription history with ID: ${dto.id} fetched successfully`);
		return SubscriptionMapper.toHistoryDto(subscriptionHistory);
	}
}
