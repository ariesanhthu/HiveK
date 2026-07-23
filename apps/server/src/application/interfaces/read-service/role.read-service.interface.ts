import { RoleDto, RoleFilterDto } from '@/application/dtos';
import { Nullable } from '@core/types';
import { IBaseReadService } from './base.read-service.interface';

export interface IRoleReadService extends IBaseReadService<RoleDto, RoleFilterDto> {
  findByTitle(title: string): Promise<Nullable<RoleDto>>;
}

export const ROLE_READ_SERVICE = Symbol('IRoleReadService');
