import { Injectable, Inject } from '@nestjs/common';
import {
  QUOTA_USAGE_REPOSITORY,
  type IQuotaUsageRepository,
} from '@/core/interfaces/repositories/quota-usage.repository';
import {
  IQuotaEnforcementService,
  type QuotaMeta,
} from '@/application/interfaces/quota-enforcement-service.interface';
import { IRequestContext } from '@/application/interfaces/request-context.interface';
import { QuotaExceededException } from '@/core/exceptions/quota.exception';

@Injectable()
export class QuotaEnforcementService implements IQuotaEnforcementService {
  constructor(
    @Inject(QUOTA_USAGE_REPOSITORY)
    private readonly quotaUsageRepository: IQuotaUsageRepository,
  ) {}

  async assertHasRoom(
    meta: QuotaMeta,
    context: IRequestContext,
  ): Promise<void> {
    const { enterpriseId } = context;

    if (!enterpriseId) {
      throw new QuotaExceededException('unknown', meta.key);
    }

    const quotaUsage =
      await this.quotaUsageRepository.findByEnterpriseId(enterpriseId);

    if (!quotaUsage) {
      throw new QuotaExceededException(enterpriseId, meta.key);
    }

    const amount =
      typeof meta.amount === 'function' ? meta.amount() : meta.amount;
    const usage = quotaUsage.usages.find((u) => u.key === meta.key);

    if (!usage) {
      throw new QuotaExceededException(enterpriseId, meta.key);
    }

    const newUsed = usage.used + amount;
    if (newUsed > usage.allocated) {
      throw new QuotaExceededException(enterpriseId, meta.key);
    }
  }
}
