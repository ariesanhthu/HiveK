import { Test, TestingModule } from '@nestjs/testing';
import { AuthSelectWorkspaceCommandHandler } from '@/application/commands/auth-select-workspace/auth-select-workspace.handler';
import { AuthSelectWorkspaceCommand } from '@/application/commands/auth-select-workspace/auth-select-workspace.command';
import { AuthSelectWorkspaceInputDto } from '@/application/commands/auth-select-workspace/auth-select-workspace.dto';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { USER_REPOSITORY, type IUserRepository } from '@/core/interfaces/repositories';
import { AuthService } from '@/application/services/auth.service';
import { WorkspaceAccessException } from '@/core/exceptions';
import { EnterpriseRoot } from '@/core/aggregate-roots/enterprise.aggregate';
import { EnterpriseUserRoot } from '@/core/aggregate-roots/enterprise-user.aggregate';
import { EEnterpriseMemberMode } from '@/core/enums';
import { ERoleType } from '@/core/enums';

describe('AuthSelectWorkspaceCommandHandler', () => {
  let handler: AuthSelectWorkspaceCommandHandler;
  let enterpriseRepository: jest.Mocked<IEnterpriseRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockEnterpriseRepository = {
      findById: jest.fn(),
    };

    const mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    const mockAuthService = {
      generateTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSelectWorkspaceCommandHandler,
        {
          provide: ENTERPRISE_REPOSITORY,
          useValue: mockEnterpriseRepository,
        },
        {
          provide: USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    handler = module.get<AuthSelectWorkspaceCommandHandler>(AuthSelectWorkspaceCommandHandler);
    enterpriseRepository = module.get(ENTERPRISE_REPOSITORY);
    userRepository = module.get(USER_REPOSITORY);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const userId = 'user-123';
    const enterpriseId = 'ent-456';
    const ownerId = 'owner-789';

    const createMockEnterprise = (isOwner = false, isSubOwner = false) => {
      const members = isSubOwner ? [{ userId, mode: EEnterpriseMemberMode.SUB_OWNER }] : [];
      
      return {
        id: enterpriseId,
        userId: isOwner ? userId : ownerId,
        isMember: jest.fn().mockReturnValue(true),
        isOwner: jest.fn().mockReturnValue(isOwner),
        isSubOwner: jest.fn().mockReturnValue(isSubOwner),
        members,
      } as unknown as EnterpriseRoot;
    };

    const createMockUser = () => {
      return {
        id: userId,
        email: 'test@example.com',
        roleId: 'role-123',
        type: ERoleType.ENTERPRISE,
        updateRefreshToken: jest.fn(),
      } as unknown as EnterpriseUserRoot;
    };

    it('should successfully select workspace for owner', async () => {
      const mockEnterprise = createMockEnterprise(true, false);
      const mockUser = createMockUser();

      enterpriseRepository.findById.mockResolvedValue(mockEnterprise);
      userRepository.findById.mockResolvedValue(mockUser);
      authService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const input = new AuthSelectWorkspaceInputDto();
      input.enterpriseId = enterpriseId;
      const command = new AuthSelectWorkspaceCommand(input, userId);

      const result = await handler.execute(command);

      expect(enterpriseRepository.findById).toHaveBeenCalledWith(enterpriseId);
      expect(mockEnterprise.isMember).toHaveBeenCalledWith(userId);
      expect(mockEnterprise.isOwner).toHaveBeenCalledWith(userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(authService.generateTokens).toHaveBeenCalledWith({
        sub: userId,
        email: 'test@example.com',
        role: 'role-123',
        type: ERoleType.ENTERPRISE,
        enterpriseId,
        ownerId: userId,
        workspaceRole: 'owner',
      });
      expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should successfully select workspace for sub-owner', async () => {
      const mockEnterprise = createMockEnterprise(false, true);
      const mockUser = createMockUser();

      enterpriseRepository.findById.mockResolvedValue(mockEnterprise);
      userRepository.findById.mockResolvedValue(mockUser);
      authService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const input = new AuthSelectWorkspaceInputDto();
      input.enterpriseId = enterpriseId;
      const command = new AuthSelectWorkspaceCommand(input, userId);

      const result = await handler.execute(command);

      expect(mockEnterprise.isOwner).toHaveBeenCalledWith(userId);
      expect(mockEnterprise.isSubOwner).toHaveBeenCalledWith(userId);
      expect(authService.generateTokens).toHaveBeenCalledWith({
        sub: userId,
        email: 'test@example.com',
        role: 'role-123',
        type: ERoleType.ENTERPRISE,
        enterpriseId,
        ownerId,
        workspaceRole: EEnterpriseMemberMode.SUB_OWNER,
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should successfully select workspace for regular member', async () => {
      const mockEnterprise = createMockEnterprise(false, false);
      const mockUser = createMockUser();

      enterpriseRepository.findById.mockResolvedValue(mockEnterprise);
      userRepository.findById.mockResolvedValue(mockUser);
      authService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      const input = new AuthSelectWorkspaceInputDto();
      input.enterpriseId = enterpriseId;
      const command = new AuthSelectWorkspaceCommand(input, userId);

      const result = await handler.execute(command);

      expect(mockEnterprise.isOwner).toHaveBeenCalledWith(userId);
      expect(mockEnterprise.isSubOwner).toHaveBeenCalledWith(userId);
      expect(authService.generateTokens).toHaveBeenCalledWith({
        sub: userId,
        email: 'test@example.com',
        role: 'role-123',
        type: ERoleType.ENTERPRISE,
        enterpriseId,
        ownerId,
        workspaceRole: EEnterpriseMemberMode.USER,
      });
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('should throw WorkspaceAccessException when enterprise not found', async () => {
      enterpriseRepository.findById.mockResolvedValue(null);

      const input = new AuthSelectWorkspaceInputDto();
      input.enterpriseId = enterpriseId;
      const command = new AuthSelectWorkspaceCommand(input, userId);

      await expect(handler.execute(command)).rejects.toThrow(WorkspaceAccessException);
      await expect(handler.execute(command)).rejects.toThrow('Enterprise not found');
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw WorkspaceAccessException when user is not a member', async () => {
      const mockEnterprise = {
        id: enterpriseId,
        userId: ownerId,
        isMember: jest.fn().mockReturnValue(false),
      } as unknown as EnterpriseRoot;

      enterpriseRepository.findById.mockResolvedValue(mockEnterprise);

      const input = new AuthSelectWorkspaceInputDto();
      input.enterpriseId = enterpriseId;
      const command = new AuthSelectWorkspaceCommand(input, userId);

      await expect(handler.execute(command)).rejects.toThrow(WorkspaceAccessException);
      await expect(handler.execute(command)).rejects.toThrow(
        'User does not have access to this workspace',
      );
      expect(userRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw WorkspaceAccessException when user not found', async () => {
      const mockEnterprise = createMockEnterprise(true, false);

      enterpriseRepository.findById.mockResolvedValue(mockEnterprise);
      userRepository.findById.mockResolvedValue(null);

      const input = new AuthSelectWorkspaceInputDto();
      input.enterpriseId = enterpriseId;
      const command = new AuthSelectWorkspaceCommand(input, userId);

      await expect(handler.execute(command)).rejects.toThrow(WorkspaceAccessException);
      await expect(handler.execute(command)).rejects.toThrow('User not found');
      expect(authService.generateTokens).not.toHaveBeenCalled();
    });

    it('should save user with updated refresh token', async () => {
      const mockEnterprise = createMockEnterprise(true, false);
      const mockUser = createMockUser();

      enterpriseRepository.findById.mockResolvedValue(mockEnterprise);
      userRepository.findById.mockResolvedValue(mockUser);
      authService.generateTokens.mockResolvedValue({
        accessToken: 'access-token',
        refreshToken: 'new-refresh-token',
      });

      const input = new AuthSelectWorkspaceInputDto();
      input.enterpriseId = enterpriseId;
      const command = new AuthSelectWorkspaceCommand(input, userId);

      await handler.execute(command);

      expect(mockUser.updateRefreshToken).toHaveBeenCalledWith('new-refresh-token');
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });
});
