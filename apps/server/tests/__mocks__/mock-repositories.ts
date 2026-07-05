import { jest } from '@jest/globals';
import { type IUserRepository } from '@/core/interfaces/repositories/user.repository';
import { type IRoleRepository } from '@/core/interfaces/repositories/role.repository';
import { type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { type ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { type IEnterpriseRepository } from '@/core/interfaces/repositories/enterprise.repository';
import { type IKolProfileRepository } from '@/core/interfaces/repositories/kol-profile.repository';
import { type IPlatformRepository } from '@/core/interfaces/repositories/platform.repository';
import { type INotificationRepository } from '@/core/interfaces/repositories/notification.repository';
import { type IUserNotificationRepository } from '@/core/interfaces/repositories/user-notification.repository';
import { type IUploadedFileRepository } from '@/core/interfaces/repositories/uploaded-file.repository';
import { type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { type IKpiLogRepository } from '@/core/interfaces/repositories/kpi-log.repository';

/**
 * Centralized mock factories for all repository interfaces.
 * Each factory returns an object with jest.fn() stubs matching the repository interface.
 */

export const createMockUserRepository = (): jest.Mocked<IUserRepository> => {
  const mock: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    findByIds: jest.fn(),
    findByEnterpriseId: jest.fn(),
    existsByRoleId: jest.fn(),
    save: jest.fn().mockImplementation(async (user: any) => {
      const generatedId = 'generated-id-' + Math.random().toString(36).substring(7);
      if (typeof user.setId === 'function') {
        try {
          if (!user.id) user.setId(generatedId);
        } catch (e) {
          // ID might already be set
        }
      } else if (!user.id) {
        user.id = generatedId;
      }
      return Promise.resolve();
    }),
    saveMany: jest.fn().mockImplementation(async (users: any[]) => {
      await Promise.all(users.map(u => mock.save(u)));
    }),
    delete: jest.fn(),
  };
  return mock;
};

export const createMockRoleRepository = (): jest.Mocked<IRoleRepository> => ({
  findById: jest.fn(),
  findByTitle: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockCampaignRepository = (): jest.Mocked<ICampaignRepository> => ({
  findById: jest.fn(),
  findByOwnerId: jest.fn(),
  findByEnterpriseId: jest.fn(),
  hasActiveCampaigns: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockCampaignParticipantRepository = (): jest.Mocked<ICampaignParticipantRepository> => ({
  findById: jest.fn(),
  findByCampaignId: jest.fn(),
  findByKolProfileId: jest.fn(),
  findByCampaignAndKol: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockEnterpriseRepository = (): jest.Mocked<IEnterpriseRepository> => {
  const mock: jest.Mocked<IEnterpriseRepository> = {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    save: jest.fn().mockImplementation(async (ent: any) => {
      const generatedId = 'generated-ent-id-' + Math.random().toString(36).substring(7);
      if (typeof ent.setId === 'function') {
        try {
          if (!ent.id) ent.setId(generatedId);
        } catch (e) {
          // ID might already be set
        }
      } else if (!ent.id) {
        ent.id = generatedId;
      }
      return Promise.resolve();
    }),
    saveMany: jest.fn().mockImplementation(async (ents: any[]) => {
      await Promise.all(ents.map(e => mock.save(e)));
    }),
    delete: jest.fn(),
  };
  return mock;
};

export const createMockKolProfileRepository = (): jest.Mocked<IKolProfileRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByPlatformInfo: jest.fn(),
  existsByPlatformId: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockPlatformRepository = (): jest.Mocked<IPlatformRepository> => ({
  findById: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockNotificationRepository = (): jest.Mocked<INotificationRepository> => ({
  findById: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockUserNotificationRepository = (): jest.Mocked<IUserNotificationRepository> => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByNotificationId: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  markAll: jest.fn(),
  updateReadStatus: jest.fn(),
  softDeleteMany: jest.fn(),
  restoreMany: jest.fn(),
  hardDeleteMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockUploadedFileRepository = (): jest.Mocked<IUploadedFileRepository> => ({
  findById: jest.fn(),
  findByTarget: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});

export const createMockOtpRepository = (): jest.Mocked<IOtpRepository> => ({
  findById: jest.fn(),
  findValidOtp: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  deleteByEmailAndType: jest.fn(),
  findRecentOtp: jest.fn(),
  delete: jest.fn(),
});

export const createMockKpiLogRepository = (): jest.Mocked<IKpiLogRepository> => ({
  findById: jest.fn(),
  findByCampaignParticipantId: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  delete: jest.fn(),
});
