import { IBaseReadService } from './base.read-service.interface';
import { UserDto } from '@/application/users/dtos/user.dto';
import { Nullable } from '@/shared/types/utility.type';

export interface IUserReadService extends IBaseReadService<UserDto> {
  findByEmail(email: string): Promise<Nullable<UserDto>>;
}

export const USER_READ_SERVICE = Symbol('IUserReadService');
