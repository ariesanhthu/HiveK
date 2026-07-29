import { IBaseReadService } from './base.read-service.interface';
import { SubscriptionResponseDto } from '@/application/dtos';
import { SubscriptionFilterDto } from '@/application/dtos';
import { Nullable } from '@/core/types';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export interface ISubscriptionReadService extends IBaseReadService<
  SubscriptionResponseDto,
  SubscriptionFilterDto
> {
  findByUserId(userId: string): Promise<Nullable<SubscriptionResponseDto>>;
}

export const SUBSCRIPTION_READ_SERVICE = Symbol('ISubscriptionReadService');
