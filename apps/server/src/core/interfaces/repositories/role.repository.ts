import { RoleRoot } from '../../aggregate-roots/role.aggregate';
import { IBaseRepository } from '../../common';

export interface IRoleRepository extends IBaseRepository<RoleRoot> {
  findByTitle(title: string): Promise<RoleRoot | null>;
}

export const ROLE_REPOSITORY = Symbol('IRoleRepository');
