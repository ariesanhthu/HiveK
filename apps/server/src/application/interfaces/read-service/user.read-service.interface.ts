import { IBaseReadService } from './base.read-service.interface';
import { UserDetailDto, UserFilterDto } from '@/application/dtos';
import { Nullable } from '@core/types';
import { ERoleType } from '@/core/enums';

export interface IUserReadService extends IBaseReadService<
  UserDetailDto,
  UserFilterDto
> {
  findByEmail(email: string): Promise<Nullable<UserDetailDto>>;
  findByRoleType(type: ERoleType): Promise<string[]>;
  findByEnterprise(enterpriseId: string): Promise<string[]>;
  findAllActive(): Promise<string[]>;
}

export const USER_READ_SERVICE = Symbol('IUserReadService');
