import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SUBSCRIPTION_HISTORY_REPOSITORY, type ISubscriptionHistoryRepository } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { SubscriptionGetListHistoryQuery } from './subscription-get-list.query';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import { SubscriptionMapper } from '../../mappers';
import type { SubscriptionHistoryResponseDTO } from '@/application/dtos';

@QueryHandler(SubscriptionGetListHistoryQuery)
export class SubscriptionGetListHistoryHandler implements IQueryHandler<SubscriptionGetListHistoryQuery> {
	constructor(
		@Inject(SUBSCRIPTION_HISTORY_REPOSITORY)
		private readonly subscriptionHistoryRepository: ISubscriptionHistoryRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: SubscriptionGetListHistoryQuery
	): Promise<PaginationCursorResponseDto<SubscriptionHistoryResponseDTO>> {
		const dto = query.dto;
		dto.limit += 1;

		const subscriptionHistories = await this.subscriptionHistoryRepository.findMany(dto);
		const hasNextPage = subscriptionHistories.length >= dto.limit;
		if (hasNextPage) {
			subscriptionHistories.pop();
		}
		return {
			items: SubscriptionMapper.toHistoryDtoList(subscriptionHistories),
			nextCursor: hasNextPage
				? subscriptionHistories[subscriptionHistories.length - 1].id
				: null,
		};
	}
}
