import { Test, TestingModule } from '@nestjs/testing';
import { QuotaEnforcementService } from '@/infrastructure/auth/quota-enforcement.service';
import { QUOTA_USAGE_REPOSITORY, type IQuotaUsageRepository } from '@/core/interfaces/repositories/quota-usage.repository';
import { QuotaExceededException } from '@/core/exceptions/quota.exception';
import { QuotaUsageRoot } from '@/core/aggregate-roots/quota-usage.aggregate';
import { RenewableUsageVO } from '@/core/value-objects/renewable-usage.vo';

describe('QuotaEnforcementService', () => {
  let service: QuotaEnforcementService;
  let quotaUsageRepository: jest.Mocked<IQuotaUsageRepository>;

  beforeEach(async () => {
    const mockQuotaUsageRepository = {
      findByEnterpriseId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotaEnforcementService,
        {
          provide: QUOTA_USAGE_REPOSITORY,
          useValue: mockQuotaUsageRepository,
        },
      ],
    }).compile();

    service = module.get<QuotaEnforcementService>(QuotaEnforcementService);
    quotaUsageRepository = module.get(QUOTA_USAGE_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assertHasRoom', () => {
    const enterpriseId = 'ent-789';
    const quotaKey = 'campaign_count';
    const context = { userId: 'user-456', ownerId: 'owner-123', enterpriseId };

    it('should succeed when quota has room', async () => {
      const mockQuotaUsage = {
        id: 'qu-1',
        enterpriseId,
        usages: [
          new RenewableUsageVO({
            key: quotaKey,
            allocated: 10,
            used: 5,
            cycleStartAt: new Date(),
            cycleEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }),
        ],
      } as QuotaUsageRoot;

      quotaUsageRepository.findByEnterpriseId.mockResolvedValue(mockQuotaUsage);

      const meta = { key: quotaKey, amount: 3 };
      await expect(service.assertHasRoom(meta, context)).resolves.not.toThrow();
      expect(quotaUsageRepository.findByEnterpriseId).toHaveBeenCalledWith(enterpriseId);
    });

    it('should succeed when amount is provided as a function', async () => {
      const mockQuotaUsage = {
        id: 'qu-1',
        enterpriseId,
        usages: [
          new RenewableUsageVO({
            key: quotaKey,
            allocated: 10,
            used: 5,
            cycleStartAt: new Date(),
            cycleEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }),
        ],
      } as QuotaUsageRoot;

      quotaUsageRepository.findByEnterpriseId.mockResolvedValue(mockQuotaUsage);

      const meta = { key: quotaKey, amount: () => 3 };
      await expect(service.assertHasRoom(meta, context)).resolves.not.toThrow();
    });

    it('should throw QuotaExceededException when quota is exceeded', async () => {
      const mockQuotaUsage = {
        id: 'qu-1',
        enterpriseId,
        usages: [
          new RenewableUsageVO({
            key: quotaKey,
            allocated: 10,
            used: 9,
            cycleStartAt: new Date(),
            cycleEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }),
        ],
      } as QuotaUsageRoot;

      quotaUsageRepository.findByEnterpriseId.mockResolvedValue(mockQuotaUsage);

      const meta = { key: quotaKey, amount: 2 };
      await expect(service.assertHasRoom(meta, context)).rejects.toThrow(QuotaExceededException);
    });

    it('should throw QuotaExceededException when quota usage not found', async () => {
      quotaUsageRepository.findByEnterpriseId.mockResolvedValue(null);

      const meta = { key: quotaKey, amount: 1 };
      await expect(service.assertHasRoom(meta, context)).rejects.toThrow(QuotaExceededException);
    });

    it('should throw QuotaExceededException when enterpriseId is missing', async () => {
      const contextWithoutEnterprise = { userId: 'user-456', ownerId: 'owner-123' };

      const meta = { key: quotaKey, amount: 1 };
      await expect(service.assertHasRoom(meta, contextWithoutEnterprise)).rejects.toThrow(
        QuotaExceededException,
      );
      expect(quotaUsageRepository.findByEnterpriseId).not.toHaveBeenCalled();
    });

    it('should throw QuotaExceededException when quota key not found in usages', async () => {
      const mockQuotaUsage = {
        id: 'qu-1',
        enterpriseId,
        usages: [
          new RenewableUsageVO({
            key: 'different_key',
            allocated: 10,
            used: 5,
            cycleStartAt: new Date(),
            cycleEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }),
        ],
      } as QuotaUsageRoot;

      quotaUsageRepository.findByEnterpriseId.mockResolvedValue(mockQuotaUsage);

      const meta = { key: quotaKey, amount: 1 };
      await expect(service.assertHasRoom(meta, context)).rejects.toThrow(QuotaExceededException);
    });

    it('should succeed when usage equals allocated exactly', async () => {
      const mockQuotaUsage = {
        id: 'qu-1',
        enterpriseId,
        usages: [
          new RenewableUsageVO({
            key: quotaKey,
            allocated: 10,
            used: 10,
            cycleStartAt: new Date(),
            cycleEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }),
        ],
      } as QuotaUsageRoot;

      quotaUsageRepository.findByEnterpriseId.mockResolvedValue(mockQuotaUsage);

      const meta = { key: quotaKey, amount: 0 };
      await expect(service.assertHasRoom(meta, context)).resolves.not.toThrow();
    });

    it('should throw QuotaExceededException when usage exceeds allocated', async () => {
      const mockQuotaUsage = {
        id: 'qu-1',
        enterpriseId,
        usages: [
          new RenewableUsageVO({
            key: quotaKey,
            allocated: 10,
            used: 11,
            cycleStartAt: new Date(),
            cycleEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }),
        ],
      } as QuotaUsageRoot;

      quotaUsageRepository.findByEnterpriseId.mockResolvedValue(mockQuotaUsage);

      const meta = { key: quotaKey, amount: 1 };
      await expect(service.assertHasRoom(meta, context)).rejects.toThrow(QuotaExceededException);
    });
  });
});
