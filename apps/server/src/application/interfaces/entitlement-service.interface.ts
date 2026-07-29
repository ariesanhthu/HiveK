import type { IRequestContext } from './request-context.interface';

export interface IEntitlementService {
  assert(permission: string, ctx: IRequestContext): Promise<void>;
  invalidateCache(ownerId: string): Promise<void>;
}

export const ENTITLEMENT_SERVICE = Symbol('ENTITLEMENT_SERVICE');
