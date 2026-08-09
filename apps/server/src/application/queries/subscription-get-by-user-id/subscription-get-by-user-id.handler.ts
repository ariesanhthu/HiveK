import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SubscriptionGetByUserIdQuery } from './subscription-get-by-user-id.query';
import type { ISubscriptionReadService } from '@/application/interfaces/read-service';
import { SUBSCRIPTION_READ_SERVICE } from '@/application/interfaces/read-service';
import { SubscriptionResponseDto } from '@/application/dtos';

@QueryHandler(SubscriptionGetByUserIdQuery)
export class SubscriptionGetByUserIdHandler implements IQueryHandler<SubscriptionGetByUserIdQuery> {
  constructor(
    @Inject(SUBSCRIPTION_READ_SERVICE)
    private readonly readService: ISubscriptionReadService,
  ) {}

  async execute(
    query: SubscriptionGetByUserIdQuery,
  ): Promise<SubscriptionResponseDto> {
    const dto = await this.readService.findByUserId(query.userId);
    if (!dto) {
      throw new NotFoundException(
        `Subscription for user ID ${query.userId} not found`,
      );
    }
    return dto;
  }
}
