import { Test, TestingModule } from '@nestjs/testing';
import { EntitlementService } from '@/infrastructure/auth/entitlement.service';
import { ENTITLEMENT_SERVICE } from '@/application/interfaces/entitlement-service.interface';
import { ISubscriptionRepository, SUBSCRIPTION_REPOSITORY } from '@/core/interfaces/repositories/subscription.repository';
import { EntitlementDeniedException } from '@/core/exceptions/auth.exception';
import { REDIS_CLIENT } from '@/application/interfaces/cache.interface';
import { SubscriptionRoot } from '@/core/aggregate-roots/subscription.aggregate';
import { ESubscriptionStatus } from '@/core/enums/subscription-status.enum';
import { PlanItemVO } from '@/core/value-objects/plan-item.vo';
import { GrantVO } from '@/core/value-objects/grant.vo';
import { EGrantType } from '@/core/enums/grant-type.enum';

describe('EntitlementService', () => {
  let service: EntitlementService;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let cacheService: { get: jest.Mock; set: jest.Mock; del: jest.Mock };

  beforeEach(async () => {
    const mockSubscriptionRepository = {
      findByUserId: jest.fn(),
    };

    const mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntitlementService,
        {
          provide: SUBSCRIPTION_REPOSITORY,
          useValue: mockSubscriptionRepository,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<EntitlementService>(EntitlementService);
    subscriptionRepository = module.get(SUBSCRIPTION_REPOSITORY);
    cacheService = mockCacheService as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assert', () => {
    const ownerId = 'owner-123';
    const permission = 'campaign.create';
    const context = { userId: 'user-456', ownerId, enterpriseId: 'ent-789' };

    it('should succeed when permission is in cache', async () => {
      const cachedPermissions = ['campaign.create', 'campaign.read'];
      cacheService.get.mockResolvedValue(JSON.stringify(cachedPermissions));

      await expect(service.assert(permission, context)).resolves.not.toThrow();
      expect(cacheService.get).toHaveBeenCalledWith(`entitlement:${ownerId}`);
      expect(subscriptionRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should fetch from database on cache miss and cache the result', async () => {
      cacheService.get.mockResolvedValue(null);

      const mockSubscription = {
        id: 'sub-1',
        userId: ownerId,
        status: ESubscriptionStatus.ACTIVE,
        planItem: null,
        addonItems: [],
        computedGrants: [],
        computedPermissions: ['campaign.create', 'campaign.read'],
        version: 1,
      } as SubscriptionRoot;

      subscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      cacheService.set.mockResolvedValue(undefined);

      await expect(service.assert(permission, context)).resolves.not.toThrow();
      expect(cacheService.get).toHaveBeenCalledWith(`entitlement:${ownerId}`);
      expect(subscriptionRepository.findByUserId).toHaveBeenCalledWith(ownerId);
      expect(cacheService.set).toHaveBeenCalledWith(
        `entitlement:${ownerId}`,
        JSON.stringify(['campaign.create', 'campaign.read']),
        'EX',
        3600,
      );
    });

    it('should throw EntitlementDeniedException when permission is not granted', async () => {
      const cachedPermissions = ['campaign.read'];
      cacheService.get.mockResolvedValue(JSON.stringify(cachedPermissions));

      await expect(service.assert(permission, context)).rejects.toThrow(
        EntitlementDeniedException,
      );
    });

    it('should throw EntitlementDeniedException when ownerId is missing', async () => {
      const contextWithoutOwner = { userId: 'user-456', enterpriseId: 'ent-789' };

      await expect(service.assert(permission, contextWithoutOwner)).rejects.toThrow(
        EntitlementDeniedException,
      );
      await expect(service.assert(permission, contextWithoutOwner)).rejects.toThrow(
        'Owner ID is required for entitlement check',
      );
    });

    it('should return empty permissions when subscription not found', async () => {
      cacheService.get.mockResolvedValue(null);
      subscriptionRepository.findByUserId.mockResolvedValue(null);
      cacheService.set.mockResolvedValue(undefined);

      await expect(service.assert(permission, context)).rejects.toThrow(
        EntitlementDeniedException,
      );
      // No caching when subscription is not found
    });

    it('should handle subscription with no computedPermissions', async () => {
      cacheService.get.mockResolvedValue(null);

      const mockSubscription = {
        id: 'sub-1',
        userId: ownerId,
        status: ESubscriptionStatus.ACTIVE,
        planItem: null,
        addonItems: [],
        computedGrants: [],
        computedPermissions: undefined,
        version: 1,
      } as SubscriptionRoot;

      subscriptionRepository.findByUserId.mockResolvedValue(mockSubscription);
      cacheService.set.mockResolvedValue(undefined);

      await expect(service.assert(permission, context)).rejects.toThrow(
        EntitlementDeniedException,
      );
      expect(cacheService.set).toHaveBeenCalledWith(
        `entitlement:${ownerId}`,
        JSON.stringify([]),
        'EX',
        3600,
      );
    });
  });

  describe('invalidateCache', () => {
    it('should delete cache entry for ownerId', async () => {
      const ownerId = 'owner-123';
      cacheService.del.mockResolvedValue(undefined);

      await service.invalidateCache(ownerId);

      expect(cacheService.del).toHaveBeenCalledWith(`entitlement:${ownerId}`);
    });

    it('should handle cache deletion errors gracefully', async () => {
      const ownerId = 'owner-123';
      cacheService.del.mockRejectedValue(new Error('Cache error'));

      await expect(service.invalidateCache(ownerId)).rejects.toThrow('Cache error');
    });
  });
});
