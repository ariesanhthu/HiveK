import { LinkEnterpriseLogoHandler } from '@/application/events/uploaded-file-created/link-enterprise-logo.handler';
import { UploadedFileCreatedEvent } from '@/application/events/uploaded-file-created/uploaded-file-created.event';
import { TargetType } from '@/core/enums';

describe('LinkEnterpriseLogoHandler', () => {
  let handler: LinkEnterpriseLogoHandler;
  let mockEnterpriseRepository: any;

  beforeEach(() => {
    mockEnterpriseRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    handler = new LinkEnterpriseLogoHandler(mockEnterpriseRepository);
  });

  it('should update enterprise logo when target is ENTERPRISE with logo field', async () => {
    const enterprise = { id: 'ent-1', update: jest.fn() };
    mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.ENTERPRISE, 'ent-1', 'logo'));

    expect(enterprise.update).toHaveBeenCalledWith({ logoUrlId: 'file-1' });
    expect(mockEnterpriseRepository.save).toHaveBeenCalledWith(enterprise);
  });

  it('should update on logoUrlId field as well', async () => {
    const enterprise = { id: 'ent-1', update: jest.fn() };
    mockEnterpriseRepository.findById.mockResolvedValue(enterprise);

    await handler.handle(new UploadedFileCreatedEvent('file-2', TargetType.ENTERPRISE, 'ent-1', 'logoUrlId'));

    expect(enterprise.update).toHaveBeenCalledWith({ logoUrlId: 'file-2' });
  });

  it('should ignore non-ENTERPRISE target types', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.USER, 'user-1', 'logo'));
    expect(mockEnterpriseRepository.findById).not.toHaveBeenCalled();
  });

  it('should ignore non-matching fields', async () => {
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.ENTERPRISE, 'ent-1', 'avatar'));
    expect(mockEnterpriseRepository.findById).not.toHaveBeenCalled();
  });

  it('should silently skip if enterprise not found', async () => {
    mockEnterpriseRepository.findById.mockResolvedValue(null);
    await handler.handle(new UploadedFileCreatedEvent('file-1', TargetType.ENTERPRISE, 'nonexistent', 'logo'));
    expect(mockEnterpriseRepository.save).not.toHaveBeenCalled();
  });
});