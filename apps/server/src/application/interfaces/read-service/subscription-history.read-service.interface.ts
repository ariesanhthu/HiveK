import { IBaseReadService } from './base.read-service.interface';
import {
  SubscriptionHistoryResponseDto,
  SubscriptionHistoryFilterDto,
} from '@/application/dtos';
import { Nullable } from '@/core/types';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export interface ISubscriptionHistoryReadService extends IBaseReadService<
  SubscriptionHistoryResponseDto,
  SubscriptionHistoryFilterDto
> {
  findBySubscriptionId(
    subscriptionId: string,
    filters?: SubscriptionHistoryFilterDto,
  ): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>>;
  findByUserId(
    userId: string,
    filters?: SubscriptionHistoryFilterDto,
  ): Promise<PaginatedResponseDto<SubscriptionHistoryResponseDto>>;
}

export const SUBSCRIPTION_HISTORY_READ_SERVICE = Symbol(
  'ISubscriptionHistoryReadService',
);
