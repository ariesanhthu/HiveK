import { EnterpriseRoot } from '../../aggregate-roots/enterprise.aggregate';
import { IBaseRepository } from '../../common';

export interface IEnterpriseRepository extends IBaseRepository<EnterpriseRoot> {
  findByUserId(userId: string): Promise<EnterpriseRoot | null>;
}

export const ENTERPRISE_REPOSITORY = Symbol('IEnterpriseRepository');
