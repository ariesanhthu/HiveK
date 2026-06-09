import { UserRoot } from '@/core/aggregate-roots';
import { Nullable } from '@/core/types';
import { IBaseRepository } from '../../common';

export interface IUserRepository extends IBaseRepository<UserRoot> {
  findByEmail(email: string): Promise<Nullable<UserRoot>>;
  findByIds(ids: string[]): Promise<UserRoot[]>;
  findByEnterpriseId(enterpriseId: string): Promise<UserRoot[]>;
  existsByRoleId(roleId: string): Promise<boolean>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
