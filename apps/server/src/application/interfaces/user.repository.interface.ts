import { UserRoot } from '@/core/aggregate-roots';
import { Nullable } from '@/shared/types';

export interface IUserRepository {
  findById(id: string): Promise<Nullable<UserRoot>>;
  findByEmail(email: string): Promise<Nullable<UserRoot>>;
  save(user: UserRoot): Promise<void>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
