import { IBaseReadService } from './base.read-service.interface';
import { EnterpriseDto } from '@/application/enterprises/dtos/enterprise.dto';
import { Nullable } from '@/shared/types/utility.type';

export interface IEnterpriseReadService extends IBaseReadService<EnterpriseDto> {
  findByUserId(userId: string): Promise<Nullable<EnterpriseDto>>;
}

export const ENTERPRISE_READ_SERVICE = Symbol('IEnterpriseReadService');
