import { IBaseReadService } from './base.read-service.interface';
import { RoleDto, RoleFilterDto } from '@/application/role/dtos';
import { Nullable } from '@/shared/types/utility.type';

export interface IRoleReadService extends IBaseReadService<RoleDto, RoleFilterDto> {
  findByTitle(title: string): Promise<Nullable<RoleDto>>;
}

export const ROLE_READ_SERVICE = Symbol('IRoleReadService');
