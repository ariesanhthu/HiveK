import { IBaseReadService } from './base.read-service.interface';
import { UserDto, UserFilterDto } from '@/application/dtos';
import { Nullable } from '@core/types';

export interface IUserReadService extends IBaseReadService<UserDto, UserFilterDto> {
  findByEmail(email: string): Promise<Nullable<UserDto>>;
}

export const USER_READ_SERVICE = Symbol('IUserReadService');
