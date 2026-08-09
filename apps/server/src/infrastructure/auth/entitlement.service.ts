import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@/application/interfaces/cache.interface';
import {
  SUBSCRIPTION_REPOSITORY,
  type ISubscriptionRepository,
} from '@/core/interfaces/repositories/subscription.repository';
import { IEntitlementService } from '@/application/interfaces/entitlement-service.interface';
import { IRequestContext } from '@/application/interfaces/request-context.interface';
import { EntitlementDeniedException } from '@/core/exceptions/auth.exception';

@Injectable()
export class EntitlementService implements IEntitlementService {
  private readonly CACHE_PREFIX = 'entitlement:';
  private readonly CACHE_TTL_SECONDS = 3600; // 1 hour

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redisClient: Redis,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async assert(permission: string, context: IRequestContext): Promise<void> {
    const { ownerId } = context;

    if (!ownerId) {
      throw new EntitlementDeniedException(
        'Owner ID is required for entitlement check',
      );
    }

    const permissions = await this.getPermissions(ownerId);

    if (!permissions.includes(permission)) {
      throw new EntitlementDeniedException(
        `Permission '${permission}' is not granted for owner ${ownerId}`,
      );
    }
  }

  async invalidateCache(ownerId: string): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${ownerId}`;
    await this.redisClient.del(cacheKey);
  }

  private async getPermissions(ownerId: string): Promise<string[]> {
    const cacheKey = `${this.CACHE_PREFIX}${ownerId}`;

    // Try to get from cache first
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Cache miss - fetch from database
    const subscription =
      await this.subscriptionRepository.findByUserId(ownerId);

    if (!subscription) {
      // No subscription found - return empty permissions
      return [];
    }

    const permissions = subscription.computedPermissions || [];

    // Cache the result
    await this.redisClient.set(
      cacheKey,
      JSON.stringify(permissions),
      'EX',
      this.CACHE_TTL_SECONDS,
    );

    return permissions;
  }
}
