import { jest } from '@jest/globals';
import { type IUserRepository } from '@/core/interfaces/repositories/user.repository';
import { type IRoleRepository } from '@/core/interfaces/repositories/role.repository';
import { type ICampaignRepository } from '@/core/interfaces/repositories/campaign.repository';
import { type IEnterpriseRepository } from '@/core/interfaces/repositories/enterprise.repository';
import { type IKolProfileRepository } from '@/core/interfaces/repositories/kol-profile.repository';
import { type IPlatformRepository } from '@/core/interfaces/repositories/platform.repository';
import { type INotificationRepository } from '@/core/interfaces/repositories/notification.repository';
import { type IUserNotificationRepository } from '@/core/interfaces/repositories/user-notification.repository';
import { type IUploadedFileRepository } from '@/core/interfaces/repositories/uploaded-file.repository';
import { type IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { type IKpiLogRepository } from '@/core/interfaces/repositories/kpi-log.repository';
import { type IEnterpriseInvitationRepository } from '@/core/interfaces/repositories/enterprise-invitation.repository';

/**
 * Centralized mock factories for all repository interfaces.
 * Each factory returns an object with jest.fn() stubs matching the repository interface.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const f = (): any => jest.fn();

export const createMockUserRepository = (): jest.Mocked<IUserRepository> => {
  const save = jest.fn().mockImplementation(async (user: any) => {
    if (!user.id && typeof user.setId === 'function') {
      user.setId('generated-id-' + Math.random().toString(36).substring(7));
    }
  });
  const saveMany = jest.fn().mockImplementation(async (users: any[]) => {
    await Promise.all(users.map((u: any) => save(u)));
  });
  return {
    findById: f(),
    findByEmail: f(),
    findByIds: f(),
    findByEnterpriseId: f(),
    existsByRoleId: f(),
    findByIdIncludingDeleted: f(),
    save,
    saveMany,
    delete: f(),
  } as unknown as jest.Mocked<IUserRepository>;
};

export const createMockRoleRepository = (): jest.Mocked<IRoleRepository> => ({
  findById: f(),
  findByTitle: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IRoleRepository>;

export const createMockCampaignRepository = (): jest.Mocked<ICampaignRepository> => ({
  findById: f(),
  findByEnterpriseId: f(),
  hasActiveCampaigns: f(),
  findByParticipantId: f(),
  findByOutputId: f(),
  findByCampaignAndKol: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<ICampaignRepository>;

export const createMockEnterpriseRepository = (): jest.Mocked<IEnterpriseRepository> => ({
  findById: f(),
  findByUserId: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IEnterpriseRepository>;

export const createMockKolProfileRepository = (): jest.Mocked<IKolProfileRepository> => ({
  findById: f(),
  findByUserId: f(),
  findByPlatformInfo: f(),
  existsByPlatformId: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IKolProfileRepository>;

export const createMockPlatformRepository = (): jest.Mocked<IPlatformRepository> => ({
  findById: f(),
  findByName: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IPlatformRepository>;

export const createMockNotificationRepository = (): jest.Mocked<INotificationRepository> => ({
  findById: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<INotificationRepository>;

export const createMockUserNotificationRepository = (): jest.Mocked<IUserNotificationRepository> => ({
  findById: f(),
  save: f(),
  saveMany: f(),
  markAll: f(),
  updateReadStatus: f(),
  softDeleteMany: f(),
  restoreMany: f(),
  hardDeleteMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IUserNotificationRepository>;

export const createMockUploadedFileRepository = (): jest.Mocked<IUploadedFileRepository> => ({
  findById: f(),
  findByTarget: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IUploadedFileRepository>;

export const createMockOtpRepository = (): jest.Mocked<IOtpRepository> => ({
  save: f(),
  saveMany: f(),
  findValidOtp: f(),
  deleteByEmailAndType: f(),
  findRecentOtp: f(),
}) as unknown as jest.Mocked<IOtpRepository>;

export const createMockKpiLogRepository = (): jest.Mocked<IKpiLogRepository> => ({
  findById: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IKpiLogRepository>;

export const createMockEnterpriseInvitationRepository = (): jest.Mocked<IEnterpriseInvitationRepository> => ({
  findById: f(),
  findByEmailAndEnterpriseId: f(),
  findPendingByEmailAndEnterpriseId: f(),
  findByEnterpriseId: f(),
  save: f(),
  saveMany: f(),
  delete: f(),
}) as unknown as jest.Mocked<IEnterpriseInvitationRepository>;