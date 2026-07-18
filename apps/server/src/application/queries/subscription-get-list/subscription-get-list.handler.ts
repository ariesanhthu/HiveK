import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionGetListQuery } from './subscription-get-list.query';
import type { ISubscriptionReadService } from "@/application/interfaces/read-service";
import { SUBSCRIPTION_READ_SERVICE } from '@/application/interfaces/read-service';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { SubscriptionResponseDto } from '@/application/dtos';

@QueryHandler(SubscriptionGetListQuery)
export class SubscriptionGetListHandler implements IQueryHandler<SubscriptionGetListQuery> {
  constructor(
    @Inject(SUBSCRIPTION_READ_SERVICE)
    private readonly readService: ISubscriptionReadService,
  ) {}

  async execute(query: SubscriptionGetListQuery): Promise<PaginatedResponseDto<SubscriptionResponseDto>> {
    return this.readService.findAll(query.filters);
  }
}
