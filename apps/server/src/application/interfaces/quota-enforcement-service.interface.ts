import type { IRequestContext } from './request-context.interface';

export interface QuotaMeta {
  key: string;
  amount: number | (() => number);
}

export interface IQuotaEnforcementService {
  assertHasRoom(meta: QuotaMeta, ctx: IRequestContext): Promise<void>;
}

export const QUOTA_ENFORCEMENT_SERVICE = Symbol('QUOTA_ENFORCEMENT_SERVICE');
