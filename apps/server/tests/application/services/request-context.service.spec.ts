import { Test, TestingModule } from '@nestjs/testing';
import { RequestContextService } from '@/application/services/request-context.service';
import type { IRequestContext } from '@/application/interfaces/request-context.interface';

describe('RequestContextService', () => {
  let service: RequestContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequestContextService],
    }).compile();

    service = module.get<RequestContextService>(RequestContextService);
  });

  describe('get', () => {
    it('should return undefined when context is not set', () => {
      const context = service.get();
      expect(context).toBeUndefined();
    });

    it('should return context when set via run', async () => {
      const testContext: IRequestContext = {
        userId: 'user-123',
        enterpriseId: 'ent-456',
        ownerId: 'owner-789',
        role: 'owner',
      };

      await service.run(testContext, async () => {
        const context = service.get();
        expect(context).toEqual(testContext);
      });
    });
  });

  describe('run', () => {
    it('should propagate context to async operations', async () => {
      const testContext: IRequestContext = {
        userId: 'user-123',
        enterpriseId: 'ent-456',
        ownerId: 'owner-789',
        role: 'owner',
      };

      let capturedContext: IRequestContext | undefined;

      await service.run(testContext, async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        capturedContext = service.get();
      });

      expect(capturedContext).toEqual(testContext);
    });

    it('should isolate contexts between different run calls', async () => {
      const context1: IRequestContext = {
        userId: 'user-1',
        enterpriseId: 'ent-1',
        ownerId: 'owner-1',
        role: 'owner',
      };

      const context2: IRequestContext = {
        userId: 'user-2',
        enterpriseId: 'ent-2',
        ownerId: 'owner-2',
        role: 'member',
      };

      let capturedContext1: IRequestContext | undefined;
      let capturedContext2: IRequestContext | undefined;

      await service.run(context1, async () => {
        capturedContext1 = service.get();
      });

      await service.run(context2, async () => {
        capturedContext2 = service.get();
      });

      expect(capturedContext1).toEqual(context1);
      expect(capturedContext2).toEqual(context2);
      expect(capturedContext1).not.toEqual(capturedContext2);
    });

    it('should return the result of the callback function', async () => {
      const testContext: IRequestContext = {
        userId: 'user-123',
      };

      const result = await service.run(testContext, async () => {
        return 'test-result';
      });

      expect(result).toBe('test-result');
    });

    it('should handle synchronous callback functions', async () => {
      const testContext: IRequestContext = {
        userId: 'user-123',
      };

      const result = await service.run(testContext, () => {
        return 'sync-result';
      });

      expect(result).toBe('sync-result');
    });

    it('should handle nested run calls with context override', async () => {
      const outerContext: IRequestContext = {
        userId: 'user-outer',
        enterpriseId: 'ent-outer',
        ownerId: 'owner-outer',
        role: 'owner',
      };

      const innerContext: IRequestContext = {
        userId: 'user-inner',
        enterpriseId: 'ent-inner',
        ownerId: 'owner-inner',
        role: 'member',
      };

      let outerCaptured: IRequestContext | undefined;
      let innerCaptured: IRequestContext | undefined;
      let afterInnerCaptured: IRequestContext | undefined;

      await service.run(outerContext, async () => {
        outerCaptured = service.get();

        await service.run(innerContext, async () => {
          innerCaptured = service.get();
        });

        afterInnerCaptured = service.get();
      });

      expect(outerCaptured).toEqual(outerContext);
      expect(innerCaptured).toEqual(innerContext);
      expect(afterInnerCaptured).toEqual(outerContext);
    });

    it('should propagate context through Promise chains', async () => {
      const testContext: IRequestContext = {
        userId: 'user-123',
        enterpriseId: 'ent-456',
      };

      const contexts: (IRequestContext | undefined)[] = [];

      await service.run(testContext, async () => {
        contexts.push(service.get());

        await Promise.resolve().then(() => {
          contexts.push(service.get());
        });

        await Promise.resolve()
          .then(() => Promise.resolve())
          .then(() => {
            contexts.push(service.get());
          });
      });

      expect(contexts).toHaveLength(3);
      contexts.forEach((ctx) => expect(ctx).toEqual(testContext));
    });

    it('should handle partial context', async () => {
      const partialContext: IRequestContext = {
        userId: 'user-123',
      };

      await service.run(partialContext, async () => {
        const context = service.get();
        expect(context).toEqual(partialContext);
        expect(context?.enterpriseId).toBeUndefined();
        expect(context?.ownerId).toBeUndefined();
        expect(context?.role).toBeUndefined();
      });
    });

    it('should clear context after run completes', async () => {
      const testContext: IRequestContext = {
        userId: 'user-123',
      };

      await service.run(testContext, async () => {
        expect(service.get()).toEqual(testContext);
      });

      expect(service.get()).toBeUndefined();
    });

    it('should clear context even if callback throws', async () => {
      const testContext: IRequestContext = {
        userId: 'user-123',
      };

      try {
        await service.run(testContext, async () => {
          expect(service.get()).toEqual(testContext);
          throw new Error('Test error');
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(service.get()).toBeUndefined();
    });
  });
});
