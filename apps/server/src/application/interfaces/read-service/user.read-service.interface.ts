import { IBaseReadService } from './base.read-service.interface';
import { UserDto, UserFilterDto } from '@/application/users/dtos';
import { Nullable } from '@/shared/types/utility.type';

export interface IUserReadService extends IBaseReadService<UserDto, UserFilterDto> {
  findByEmail(email: string): Promise<Nullable<UserDto>>;
}

export const USER_READ_SERVICE = Symbol('IUserReadService');
