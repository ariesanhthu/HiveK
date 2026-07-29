import { IBaseReadService } from './base.read-service.interface';
import { QuotaUsageResponseDto, QuotaUsageFilterDto } from '@/application/dtos';
import { Nullable } from '@/core/types';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export interface IQuotaUsageReadService extends IBaseReadService<
  QuotaUsageResponseDto,
  QuotaUsageFilterDto
> {
  findByEnterpriseId(
    enterpriseId: string,
  ): Promise<Nullable<QuotaUsageResponseDto>>;
}

export const QUOTA_USAGE_READ_SERVICE = Symbol('IQuotaUsageReadService');
