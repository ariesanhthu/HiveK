import { EnterpriseCreateCommandHandler } from '@/application/commands/enterprise-create/enterprise-create.handler';
import { EnterpriseCreateCommand } from '@/application/commands/enterprise-create/enterprise-create.command';
import { EnterpriseConflictException, UserNotFoundException, InvalidUserTypeException } from '@/core/exceptions';
import { EnterpriseUserRoot, EnterpriseRoot, KOLUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import { createMockUserRepository, createMockEnterpriseRepository } from '../../../__mocks__/mock-repositories';
import { createMockUnitOfWork } from '../../../__mocks__/mock-services';

describe('EnterpriseCreateCommandHandler', () => {
  let handler: EnterpriseCreateCommandHandler;
  let mockEnterpriseRepository: ReturnType<typeof createMockEnterpriseRepository>;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockUow: ReturnType<typeof createMockUnitOfWork>;

  beforeEach(() => {
    mockEnterpriseRepository = createMockEnterpriseRepository();
    mockUserRepository = createMockUserRepository();
    mockUow = createMockUnitOfWork();
    
    handler = new EnterpriseCreateCommandHandler(
      mockEnterpriseRepository, 
      mockUserRepository, 
      mockUow
    );
  });

  const userId = 'user-123';
  const input = {
    companyName: 'Test Company',
    description: 'Test Description',
    contactEmail: 'contact@test.com',
    contactPhone: '+841234567890',
    website: 'https://test.com',
    taxId: 'TAX123',
  };

  describe('Happy Paths', () => {
    it('should create enterprise successfully and associate with user', async () => {
      mockEnterpriseRepository.findByUserId.mockResolvedValue(null);
      
      const mockUser = EnterpriseUserRoot.create({
          email: 'ent@test.com',
          phone: { value: '+84123456789' } as any,
          passwordHash: 'hash',
          fullName: 'Ent User',
          type: ERoleType.ENTERPRISE,
          roleId: 'role-ent',
          isEmailVerified: true,
      });
      mockUser.setId(userId);
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const command = new EnterpriseCreateCommand(userId, input);
      const result = await handler.execute(command);

      expect(result).toBeDefined();
      expect(result.companyName).toBe(input.companyName);
      
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(expect.any(EnterpriseRoot));
      
      const savedEnterprise = mockEnterpriseRepository.save.mock.calls[0][0] as EnterpriseRoot;
      expect(mockUser.enterpriseIds).toContain(savedEnterprise.id);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('Sad Paths', () => {
    it('should throw UserNotFoundException if user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      const command = new EnterpriseCreateCommand(userId, input);
      await expect(handler.execute(command)).rejects.toThrow(UserNotFoundException);
      expect(mockEnterpriseRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidUserTypeException if user is not ENTERPRISE type', async () => {
      const kolUser = KOLUserRoot.create({
          email: 'kol@test.com',
          phone: { value: '+841' } as any,
          passwordHash: 'h',
          fullName: 'KOL',
          type: ERoleType.KOL,
          roleId: 'r',
      });
      mockUserRepository.findById.mockResolvedValue(kolUser);
      const command = new EnterpriseCreateCommand(userId, input);
      await expect(handler.execute(command)).rejects.toThrow(InvalidUserTypeException);
    });

    it('should throw EnterpriseConflictException if user already has an enterprise profile', async () => {
      const mockUser = EnterpriseUserRoot.create({
        email: 'ent@test.com',
        phone: { value: '+841' } as any,
        passwordHash: 'h',
        fullName: 'E',
        type: ERoleType.ENTERPRISE,
        roleId: 'r',
      });
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockEnterpriseRepository.findByUserId.mockResolvedValue({ id: 'existing' } as any);

      const command = new EnterpriseCreateCommand(userId, input);
      await expect(handler.execute(command)).rejects.toThrow(EnterpriseConflictException);
    });
  });
});
