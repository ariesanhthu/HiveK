import { IBaseReadService } from './base.read-service.interface';
import { EnterpriseDto, EnterpriseFilterDto } from '@/application/enterprises/dtos';
import { Nullable } from '@/shared/types/utility.type';

export interface IEnterpriseReadService extends IBaseReadService<EnterpriseDto, EnterpriseFilterDto> {
  findByUserId(userId: string): Promise<Nullable<EnterpriseDto>>;
}

export const ENTERPRISE_READ_SERVICE = Symbol('IEnterpriseReadService');
