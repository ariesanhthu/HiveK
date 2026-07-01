import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { type ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { SubscriptionGetListQuery } from './subscription-get-list.query';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import { SubscriptionMapper } from '../../mappers';
import type { SubscriptionResponseDTO } from '@/application/dtos';

@QueryHandler(SubscriptionGetListQuery)
export class SubscriptionGetListHandler implements IQueryHandler<SubscriptionGetListQuery> {
	constructor(
		@Inject(SUBSCRIPTION_REPOSITORY)
		private readonly subscriptionRepository: ISubscriptionRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: SubscriptionGetListQuery
	): Promise<PaginationCursorResponseDto<SubscriptionResponseDTO>> {
		const dto = query.dto;
		dto.limit += 1;

		const subscriptions = await this.subscriptionRepository.findMany(dto);
		const hasNextPage = subscriptions.length >= dto.limit;
		if (hasNextPage) {
			subscriptions.pop();
		}
		return {
			items: SubscriptionMapper.toDtoList(subscriptions),
			nextCursor: hasNextPage ? subscriptions[subscriptions.length - 1].id : null,
		};
	}
}
