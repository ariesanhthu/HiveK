import { IBaseReadService } from './base.read-service.interface';
import { UserDetailDto, UserFilterDto } from '@/application/dtos';
import { Nullable } from '@core/types';

export interface IUserReadService extends IBaseReadService<UserDetailDto, UserFilterDto> {
  findByEmail(email: string): Promise<Nullable<UserDetailDto>>;
}

export const USER_READ_SERVICE = Symbol('IUserReadService');
