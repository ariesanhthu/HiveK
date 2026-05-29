import { IBaseReadService } from './base.read-service.interface';
import { EnterpriseDto, EnterpriseFilterDto } from '@/application/dtos';
import { Nullable } from '@core/types';

export interface IEnterpriseReadService extends IBaseReadService<EnterpriseDto, EnterpriseFilterDto> {
  findByUserId(userId: string): Promise<Nullable<EnterpriseDto>>;
}

export const ENTERPRISE_READ_SERVICE = Symbol('IEnterpriseReadService');
