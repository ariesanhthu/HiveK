import { IBaseRepository } from '../../common';
import { EnterpriseQuotaAllocationRoot } from '../../aggregate-roots/enterprise-quota-allocation.aggregate';

export interface IEnterpriseQuotaAllocationRepository extends IBaseRepository<EnterpriseQuotaAllocationRoot> {
  findByOwnerId(ownerId: string): Promise<EnterpriseQuotaAllocationRoot | null>;
}

export const ENTERPRISE_QUOTA_ALLOCATION_REPOSITORY = Symbol(
  'IEnterpriseQuotaAllocationRepository',
);
