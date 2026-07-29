import { IBaseReadService } from './base.read-service.interface';
import { EnterpriseDetailDto } from '@/application/dtos';
import { EnterpriseFilterDto } from '@/application/queries/enterprise-get-list/enterprise-get-list.dto';
import { Nullable } from '@core/types';

import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export interface IEnterpriseReadService extends IBaseReadService<
  EnterpriseDetailDto,
  EnterpriseFilterDto
> {
  findByUserId(userId: string): Promise<Nullable<EnterpriseDetailDto>>;
  findByUserIdOrMember(
    userId: string,
    filters?: EnterpriseFilterDto,
  ): Promise<PaginatedResponseDto<EnterpriseDetailDto>>;
}

export const ENTERPRISE_READ_SERVICE = Symbol('IEnterpriseReadService');
