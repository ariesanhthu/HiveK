import { EnterpriseDetailDto } from '@/application/dtos';
import { EnterpriseFilterDto } from '@/application/queries/enterprise-get-list/enterprise-get-list.dto';
import { Nullable } from '@core/types';
import { IBaseReadService } from './base.read-service.interface';

export interface IEnterpriseReadService
  extends IBaseReadService<EnterpriseDetailDto, EnterpriseFilterDto>
{
  findByUserId(userId: string): Promise<Nullable<EnterpriseDetailDto>>;
}

export const ENTERPRISE_READ_SERVICE = Symbol('IEnterpriseReadService');
