import { UserRoot } from '@/core/aggregate-roots';
import { Nullable } from '@/shared/types';
import { IBaseRepository } from '../common';

export interface IUserRepository extends IBaseRepository<UserRoot> {
  findByEmail(email: string): Promise<Nullable<UserRoot>>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
