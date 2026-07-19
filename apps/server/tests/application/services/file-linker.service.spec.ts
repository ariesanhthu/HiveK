import { FileLinkerService } from '@/application/services/file-linker.service';
import { ETargetType, EUploadTargetField } from '@/core/enums';
import { UploadedFileRoot } from '@/core/aggregate-roots';
function createUploadedFile(
  targetType: ETargetType,
  targetId: string,
  targetField: string,
): UploadedFileRoot {
  return UploadedFileRoot.instantiate('file-1', {
    url: 'http://cloudinary.com/file',
    publicId: 'public-id',
    size: 100,
    format: 'jpg',
    title: null,
    targetType,
    targetId,
    targetField,
    deleteAt: null,
    deleteBy: null,
    createdAt: new Date('2026-07-01'),
    updatedAt: new Date('2026-07-01'),
  });
}

describe('FileLinkerService', () => {
  // Repository mocks
  let mockUserRepo: any;
  let mockEnterpriseRepo: any;
  let mockPlatformRepo: any;
  let mockCampaignRepo: any;
  let mockScheduledPostRepo: any;
  // Service under test
  let linker: FileLinkerService;

  beforeEach(() => {
    mockUserRepo = { findById: jest.fn(), save: jest.fn() };
    mockEnterpriseRepo = { findById: jest.fn(), save: jest.fn() };
    mockPlatformRepo = { findById: jest.fn(), save: jest.fn() };
    mockCampaignRepo = { findById: jest.fn(), save: jest.fn() };
    mockScheduledPostRepo = { findById: jest.fn(), save: jest.fn() };

    linker = new FileLinkerService(
      mockUserRepo,
      mockEnterpriseRepo,
      mockPlatformRepo,
      mockCampaignRepo,
      mockScheduledPostRepo,
    );
  });

  describe('linkUser', () => {
    it('should update user avatar when target is USER and field is AVATAR', async () => {
      const user = { setAvatar: jest.fn() };
      mockUserRepo.findById.mockResolvedValue(user);
      const root = createUploadedFile(ETargetType.USER, 'user-1', EUploadTargetField.AVATAR);

      await linker.link(root);

      expect(mockUserRepo.findById).toHaveBeenCalledWith('user-1');
      expect(user.setAvatar).toHaveBeenCalledWith('file-1');
      expect(mockUserRepo.save).toHaveBeenCalledWith(user);
    });

    it('should skip linkUser when targetField is not AVATAR', async () => {
      const root = createUploadedFile(ETargetType.USER, 'user-1', 'logo');

      await linker.link(root);

      expect(mockUserRepo.findById).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it('should skip linkUser when user is not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);
      const root = createUploadedFile(ETargetType.USER, 'nonexistent', EUploadTargetField.AVATAR);

      await linker.link(root);

      expect(mockUserRepo.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('linkEnterprise', () => {
    it('should update enterprise logo when target is ENTERPRISE and field is LOGO_URL_ID', async () => {
      const enterprise = { update: jest.fn() };
      mockEnterpriseRepo.findById.mockResolvedValue(enterprise);
      const root = createUploadedFile(ETargetType.ENTERPRISE, 'ent-1', EUploadTargetField.LOGO_URL_ID);

      await linker.link(root);

      expect(mockEnterpriseRepo.findById).toHaveBeenCalledWith('ent-1');
      expect(enterprise.update).toHaveBeenCalledWith({ logoUrlId: 'file-1' });
      expect(mockEnterpriseRepo.save).toHaveBeenCalledWith(enterprise);
    });

    it('should skip linkEnterprise when targetField is not LOGO_URL_ID', async () => {
      const root = createUploadedFile(ETargetType.ENTERPRISE, 'ent-1', 'avatar');

      await linker.link(root);

      expect(mockEnterpriseRepo.findById).not.toHaveBeenCalled();
      expect(mockEnterpriseRepo.save).not.toHaveBeenCalled();
    });

    it('should skip linkEnterprise when enterprise is not found', async () => {
      mockEnterpriseRepo.findById.mockResolvedValue(null);
      const root = createUploadedFile(ETargetType.ENTERPRISE, 'nonexistent', EUploadTargetField.LOGO_URL_ID);

      await linker.link(root);

      expect(mockEnterpriseRepo.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockEnterpriseRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('linkPlatform', () => {
    it('should update platform icon when target is PLATFORM and field is ICON', async () => {
      const platform = { updateIcon: jest.fn() };
      mockPlatformRepo.findById.mockResolvedValue(platform);
      const root = createUploadedFile(ETargetType.PLATFORM, 'plat-1', EUploadTargetField.ICON);

      await linker.link(root);

      expect(mockPlatformRepo.findById).toHaveBeenCalledWith('plat-1');
      expect(platform.updateIcon).toHaveBeenCalledWith('file-1');
      expect(mockPlatformRepo.save).toHaveBeenCalledWith(platform);
    });

    it('should skip linkPlatform when targetField is not ICON', async () => {
      const root = createUploadedFile(ETargetType.PLATFORM, 'plat-1', 'avatar');

      await linker.link(root);

      expect(mockPlatformRepo.findById).not.toHaveBeenCalled();
      expect(mockPlatformRepo.save).not.toHaveBeenCalled();
    });

    it('should skip linkPlatform when platform is not found', async () => {
      mockPlatformRepo.findById.mockResolvedValue(null);
      const root = createUploadedFile(ETargetType.PLATFORM, 'nonexistent', EUploadTargetField.ICON);

      await linker.link(root);

      expect(mockPlatformRepo.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockPlatformRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('linkCampaign', () => {
    it('should append raw contents to campaign when target is CAMPAIGN and field is RAW', async () => {
      const campaign = { rawContents: [], update: jest.fn() };
      mockCampaignRepo.findById.mockResolvedValue(campaign);
      const root = createUploadedFile(ETargetType.CAMPAIGN, 'cmp-1', EUploadTargetField.RAW);

      await linker.link(root);

      expect(mockCampaignRepo.findById).toHaveBeenCalledWith('cmp-1');
      expect(campaign.update).toHaveBeenCalledWith({
        rawContents: [{ fileId: 'file-1', rawContent: '' }],
      });
      expect(mockCampaignRepo.save).toHaveBeenCalledWith(campaign);
    });

    it('should append to existing rawContents', async () => {
      const campaign = {
        rawContents: [{ fileId: 'old-file', rawContent: 'existing' }],
        update: jest.fn(),
      };
      mockCampaignRepo.findById.mockResolvedValue(campaign);
      const root = createUploadedFile(ETargetType.CAMPAIGN, 'cmp-1', EUploadTargetField.RAW);

      await linker.link(root);

      expect(campaign.update).toHaveBeenCalledWith({
        rawContents: [
          { fileId: 'old-file', rawContent: 'existing' },
          { fileId: 'file-1', rawContent: '' },
        ],
      });
    });

    it('should skip linkCampaign when targetField is not RAW', async () => {
      const root = createUploadedFile(ETargetType.CAMPAIGN, 'cmp-1', 'avatar');

      await linker.link(root);

      expect(mockCampaignRepo.findById).not.toHaveBeenCalled();
      expect(mockCampaignRepo.save).not.toHaveBeenCalled();
    });

    it('should skip linkCampaign when campaign is not found', async () => {
      mockCampaignRepo.findById.mockResolvedValue(null);
      const root = createUploadedFile(ETargetType.CAMPAIGN, 'nonexistent', EUploadTargetField.RAW);

      await linker.link(root);

      expect(mockCampaignRepo.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockCampaignRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('linkScheduledPost', () => {
    it('should add media file to scheduled post when target is SCHEDULED_POST and field is MEDIA_FILE_IDS', async () => {
      const post = { addMediaFile: jest.fn() };
      mockScheduledPostRepo.findById.mockResolvedValue(post);
      const root = createUploadedFile(ETargetType.SCHEDULED_POST, 'post-1', EUploadTargetField.MEDIA_FILE_IDS);

      await linker.link(root);

      expect(mockScheduledPostRepo.findById).toHaveBeenCalledWith('post-1');
      expect(post.addMediaFile).toHaveBeenCalledWith('file-1');
      expect(mockScheduledPostRepo.save).toHaveBeenCalledWith(post);
    });

    it('should skip linkScheduledPost when targetField is not MEDIA_FILE_IDS', async () => {
      const root = createUploadedFile(ETargetType.SCHEDULED_POST, 'post-1', 'avatar');

      await linker.link(root);

      expect(mockScheduledPostRepo.findById).not.toHaveBeenCalled();
      expect(mockScheduledPostRepo.save).not.toHaveBeenCalled();
    });

    it('should skip linkScheduledPost when post is not found', async () => {
      mockScheduledPostRepo.findById.mockResolvedValue(null);
      const root = createUploadedFile(ETargetType.SCHEDULED_POST, 'nonexistent', EUploadTargetField.MEDIA_FILE_IDS);

      await linker.link(root);

      expect(mockScheduledPostRepo.findById).toHaveBeenCalledWith('nonexistent');
      expect(mockScheduledPostRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('unhandled target types', () => {
    it('should silently ignore CAMPAIGN_PARTICIPANT (TODO)', async () => {
      const root = createUploadedFile(
        ETargetType.CAMPAIGN_PARTICIPANT,
        'cp-1',
        'fileId',
      );

      await linker.link(root);

      expect(mockUserRepo.findById).not.toHaveBeenCalled();
      expect(mockEnterpriseRepo.findById).not.toHaveBeenCalled();
      expect(mockPlatformRepo.findById).not.toHaveBeenCalled();
      expect(mockCampaignRepo.findById).not.toHaveBeenCalled();
      expect(mockScheduledPostRepo.findById).not.toHaveBeenCalled();
    });
  });
});
