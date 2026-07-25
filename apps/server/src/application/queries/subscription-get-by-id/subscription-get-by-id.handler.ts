import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { SubscriptionGetByIdQuery } from './subscription-get-by-id.query';
import type { ISubscriptionReadService } from "@/application/interfaces/read-service";
import { SUBSCRIPTION_READ_SERVICE } from '@/application/interfaces/read-service';
import { SubscriptionResponseDto } from '@/application/dtos';

@QueryHandler(SubscriptionGetByIdQuery)
export class SubscriptionGetByIdHandler implements IQueryHandler<SubscriptionGetByIdQuery> {
  constructor(
    @Inject(SUBSCRIPTION_READ_SERVICE)
    private readonly readService: ISubscriptionReadService,
  ) {}

  async execute(query: SubscriptionGetByIdQuery): Promise<SubscriptionResponseDto> {
    const dto = await this.readService.findById(query.id);
    if (!dto) {
      throw new NotFoundException(`Subscription with ID ${query.id} not found`);
    }
    return dto;
  }
}
