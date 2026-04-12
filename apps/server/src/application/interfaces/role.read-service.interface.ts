import { IBaseReadService } from './base.read-service.interface';
import { RoleDto } from '@/application/role/dtos/role.dto';
import { Nullable } from '@/shared/types/utility.type';

export interface IRoleReadService extends IBaseReadService<RoleDto> {
  findByTitle(title: string): Promise<Nullable<RoleDto>>;
}

export const ROLE_READ_SERVICE = Symbol('IRoleReadService');
