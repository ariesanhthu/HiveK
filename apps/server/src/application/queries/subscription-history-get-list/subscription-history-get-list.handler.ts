import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionHistoryGetListQuery } from './subscription-history-get-list.query';
import type { ISubscriptionHistoryReadService } from '@/application/interfaces/read-service';
import { SUBSCRIPTION_HISTORY_READ_SERVICE } from '@/application/interfaces/read-service';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { SubscriptionHistoryResponseDto } from '@/application/dtos';

@QueryHandler(SubscriptionHistoryGetListQuery)
export class SubscriptionHistoryGetListHandler implements IQueryHandler<SubscriptionHistoryGetListQuery> {
  constructor(
    @Inject(SUBSCRIPTION_HISTORY_READ_SERVICE)
    private readonly readService: ISubscriptionHistoryReadService,
  ) {}

  async execute(
    query: SubscriptionHistoryGetListQuery,
  ): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>> {
    return this.readService.findAll(query.filters);
  }
}
