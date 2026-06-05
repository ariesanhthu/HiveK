import { jest } from '@jest/globals';

/**
 * Centralized mock factories for all repository interfaces.
 * Each factory returns an object with jest.fn() stubs matching the repository interface.
 */

export const createMockUserRepository = () => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockRoleRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockCampaignRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByOwnerId: jest.fn(),
  findByEnterpriseId: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockCampaignParticipantRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCampaignId: jest.fn(),
  findByKolProfileId: jest.fn(),
  findByCampaignAndKol: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockEnterpriseRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByOwnerId: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockKolProfileRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByUserId: jest.fn(),
  findByPlatform: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockPlatformRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByCode: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockNotificationRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
});

export const createMockUserNotificationRepository = () => ({
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByNotificationId: jest.fn(),
  save: jest.fn(),
  saveMany: jest.fn(),
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  softDelete: jest.fn(),
});

export const createMockUploadedFileRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  findByTarget: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  hardDelete: jest.fn(),
  restore: jest.fn(),
});

export const createMockOtpRepository = () => ({
  findByEmail: jest.fn(),
  findValidOtp: jest.fn(),
  save: jest.fn(),
  invalidateAll: jest.fn(),
});

export const createMockKpiLogRepository = () => ({
  findById: jest.fn(),
  findByCampaignParticipantId: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
});