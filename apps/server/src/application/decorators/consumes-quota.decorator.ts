import { SetMetadata } from '@nestjs/common';
import type { QuotaMeta } from '@/application/interfaces/quota-enforcement-service.interface';

export const CONSUMES_QUOTA = 'consumes_quota';

export const ConsumesQuota = (meta: QuotaMeta) =>
  SetMetadata(CONSUMES_QUOTA, meta);

export type { QuotaMeta };
