import { IBaseRepository } from '../../common';
import { QuotaUsageRoot } from '../../aggregate-roots/quota-usage.aggregate';
import { Nullable } from '../../types';

export interface IQuotaUsageRepository extends IBaseRepository<QuotaUsageRoot> {
  findByEnterpriseId(enterpriseId: string): Promise<Nullable<QuotaUsageRoot>>;
  findExpiredUsages(now: Date): Promise<QuotaUsageRoot[]>;
}

export const QUOTA_USAGE_REPOSITORY = Symbol('IQuotaUsageRepository');
