import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { Reflector } from '@nestjs/core';
import { GuardedCommandBus } from '@/infrastructure/auth/guarded-command-bus';
import { ENTITLEMENT_SERVICE, type IEntitlementService } from '@/application/interfaces/entitlement-service.interface';
import { QUOTA_ENFORCEMENT_SERVICE, type IQuotaEnforcementService } from '@/application/interfaces/quota-enforcement-service.interface';
import { RequestContextService } from '@/application/services/request-context.service';
import { REQUIRES_PERMISSION } from '@/application/decorators/requires-permission.decorator';
import { CONSUMES_QUOTA } from '@/application/decorators/consumes-quota.decorator';
import { EntitlementDeniedException } from '@/core/exceptions/auth.exception';
import { QuotaExceededException } from '@/core/exceptions/quota.exception';
import type { IRequestContext } from '@/application/interfaces/request-context.interface';
import { ModuleRef } from '@nestjs/core';

describe('GuardedCommandBus', () => {
  let guardedBus: GuardedCommandBus;
  let mockReflector: jest.Mocked<Reflector>;
  let mockEntitlementService: jest.Mocked<IEntitlementService>;
  let mockQuotaEnforcementService: jest.Mocked<IQuotaEnforcementService>;
  let mockRequestContextService: jest.Mocked<RequestContextService>;
  let mockModuleRef: any;

  beforeEach(() => {
    mockReflector = {
      get: jest.fn(),
    } as any;

    mockEntitlementService = {
      assert: jest.fn(),
      invalidateCache: jest.fn(),
    } as any;

    mockQuotaEnforcementService = {
      assertHasRoom: jest.fn(),
    } as any;

    mockRequestContextService = {
      get: jest.fn(),
      run: jest.fn(),
    } as any;

    mockModuleRef = {};

    // Mock super.execute (from CommandBus) BEFORE instantiation
    jest.spyOn(CommandBus.prototype, 'execute').mockResolvedValue(undefined as any);

    // Instantiate directly, bypassing NestJS DI
    guardedBus = new GuardedCommandBus(
      mockModuleRef as unknown as ModuleRef,
      mockReflector,
      mockEntitlementService,
      mockQuotaEnforcementService,
      mockRequestContextService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const testContext: IRequestContext = {
      userId: 'user-123',
      enterpriseId: 'ent-456',
      ownerId: 'owner-789',
      role: 'owner',
    };

    class TestCommand {
      constructor(public readonly data: string) {}
    }

    it('should skip checks when no request context is set', async () => {
      mockRequestContextService.get.mockReturnValue(undefined);

      const command = new TestCommand('test');
      const result = await guardedBus.execute(command);

      expect(mockRequestContextService.get).toHaveBeenCalled();
      expect(mockReflector.get).not.toHaveBeenCalled();
      expect(mockEntitlementService.assert).not.toHaveBeenCalled();
      expect(mockQuotaEnforcementService.assertHasRoom).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should check entitlement when @RequiresPermission is present', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockImplementation((key: string) => {
        if (key === REQUIRES_PERMISSION) return 'campaign.create';
        return undefined;
      });
      mockEntitlementService.assert.mockResolvedValue(undefined);

      const command = new TestCommand('test');
      await guardedBus.execute(command);

      expect(mockReflector.get).toHaveBeenCalledWith(REQUIRES_PERMISSION, TestCommand);
      expect(mockEntitlementService.assert).toHaveBeenCalledWith('campaign.create', testContext);
      expect(mockQuotaEnforcementService.assertHasRoom).not.toHaveBeenCalled();
    });

    it('should check quota when @ConsumesQuota is present', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockImplementation((key: string) => {
        if (key === CONSUMES_QUOTA) return { key: 'campaign_count', amount: 1 };
        return undefined;
      });
      mockQuotaEnforcementService.assertHasRoom.mockResolvedValue(undefined);

      const command = new TestCommand('test');
      await guardedBus.execute(command);

      expect(mockReflector.get).toHaveBeenCalledWith(CONSUMES_QUOTA, TestCommand);
      expect(mockEntitlementService.assert).not.toHaveBeenCalled();
      expect(mockQuotaEnforcementService.assertHasRoom).toHaveBeenCalledWith(
        { key: 'campaign_count', amount: 1 },
        testContext,
      );
    });

    it('should check both entitlement and quota when both decorators are present', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockImplementation((key: string) => {
        if (key === REQUIRES_PERMISSION) return 'campaign.create';
        if (key === CONSUMES_QUOTA) return { key: 'campaign_count', amount: 1 };
        return undefined;
      });
      mockEntitlementService.assert.mockResolvedValue(undefined);
      mockQuotaEnforcementService.assertHasRoom.mockResolvedValue(undefined);

      const command = new TestCommand('test');
      await guardedBus.execute(command);

      expect(mockEntitlementService.assert).toHaveBeenCalledWith('campaign.create', testContext);
      expect(mockQuotaEnforcementService.assertHasRoom).toHaveBeenCalledWith(
        { key: 'campaign_count', amount: 1 },
        testContext,
      );
    });

    it('should throw EntitlementDeniedException when entitlement check fails', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockImplementation((key: string) => {
        if (key === REQUIRES_PERMISSION) return 'campaign.create';
        return undefined;
      });
      mockEntitlementService.assert.mockRejectedValue(
        new EntitlementDeniedException('Permission denied'),
      );

      const command = new TestCommand('test');
      await expect(guardedBus.execute(command)).rejects.toThrow(EntitlementDeniedException);
      expect(mockQuotaEnforcementService.assertHasRoom).not.toHaveBeenCalled();
    });

    it('should throw QuotaExceededException when quota check fails', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockImplementation((key: string) => {
        if (key === CONSUMES_QUOTA) return { key: 'campaign_count', amount: 1 };
        return undefined;
      });
      mockQuotaEnforcementService.assertHasRoom.mockRejectedValue(
        new QuotaExceededException('ent-456', 'campaign_count'),
      );

      const command = new TestCommand('test');
      await expect(guardedBus.execute(command)).rejects.toThrow(QuotaExceededException);
    });

    it('should execute command when no decorators are present', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockReturnValue(undefined);

      const command = new TestCommand('test');
      await guardedBus.execute(command);

      expect(mockEntitlementService.assert).not.toHaveBeenCalled();
      expect(mockQuotaEnforcementService.assertHasRoom).not.toHaveBeenCalled();
    });

    it('should pass context parameter to super.execute', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockReturnValue(undefined);

      const command = new TestCommand('test');
      const context = { someContext: 'value' };
      await guardedBus.execute(command, context);

      // super.execute receives the context
    });

    it('should check entitlement before quota', async () => {
      mockRequestContextService.get.mockReturnValue(testContext);
      mockReflector.get.mockImplementation((key: string) => {
        if (key === REQUIRES_PERMISSION) return 'campaign.create';
        if (key === CONSUMES_QUOTA) return { key: 'campaign_count', amount: 1 };
        return undefined;
      });

      const callOrder: string[] = [];
      mockEntitlementService.assert.mockImplementation(async () => {
        callOrder.push('entitlement');
      });
      mockQuotaEnforcementService.assertHasRoom.mockImplementation(async () => {
        callOrder.push('quota');
      });

      const command = new TestCommand('test');
      await guardedBus.execute(command);

      expect(callOrder).toEqual(['entitlement', 'quota']);
    });
  });
});
