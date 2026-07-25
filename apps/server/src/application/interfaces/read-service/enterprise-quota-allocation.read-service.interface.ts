import { IBaseReadService } from './base.read-service.interface';
import { EnterpriseQuotaAllocationResponseDto, EnterpriseQuotaAllocationFilterDto } from '@/application/dtos';
import { Nullable } from '@/core/types';

export interface IEnterpriseQuotaAllocationReadService extends IBaseReadService<EnterpriseQuotaAllocationResponseDto, EnterpriseQuotaAllocationFilterDto> {
  findByOwnerId(ownerId: string): Promise<Nullable<EnterpriseQuotaAllocationResponseDto>>;
}

export const ENTERPRISE_QUOTA_ALLOCATION_READ_SERVICE = Symbol('IEnterpriseQuotaAllocationReadService');
