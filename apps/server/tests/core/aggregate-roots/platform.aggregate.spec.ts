import { PlatformRoot } from '@core/aggregate-roots/platform.aggregate';
import { EPlatformApiStatus } from '@core/enums/platform-api-status.enum';

describe('PlatformRoot Aggregate Root', () => {
  const createProps = {
    name: 'YouTube',
    baseUrl: 'https://youtube.com',
    apiStatus: EPlatformApiStatus.STABLE,
  };

  const fullProps = {
    name: 'YouTube',
    baseUrl: 'https://youtube.com',
    apiStatus: EPlatformApiStatus.STABLE,
    icon: 'icon-youtube-id',
    deleteAt: null,
    deleteBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should create a PlatformRoot with lowercase name and null icon', () => {
    const root = PlatformRoot.create(createProps);

    expect(root).toBeDefined();
    expect(root.name).toBe('youtube'); // verified lowercase conversion
    expect(root.baseUrl).toBe(createProps.baseUrl);
    expect(root.apiStatus).toBe(createProps.apiStatus);
    expect(root.icon).toBeNull();
  });

  it('should instantiate a PlatformRoot with id', () => {
    const root = PlatformRoot.instantiate('id-123', fullProps);

    expect(root).toBeDefined();
    expect(root.id).toBe('id-123');
    expect(root.name).toBe(fullProps.name); // instantiate does not change properties
    expect(root.icon).toBe(fullProps.icon);
  });

  it('should update api status and icon url correctly', () => {
    const root = PlatformRoot.create(createProps);

    root.updateApiStatus(EPlatformApiStatus.MAINTENANCE);
    expect(root.apiStatus).toBe(EPlatformApiStatus.MAINTENANCE);

    root.updateIcon('newicon-id');
    expect(root.icon).toBe('newicon-id');
  });

  it('should soft delete correctly', () => {
    const root = PlatformRoot.create(createProps);
    root.softDelete('admin-1');

    expect(root.deleteAt).toBeInstanceOf(Date);
    expect(root.deleteBy).toBe('admin-1');
  });

  it('should restore correctly', () => {
    const root = PlatformRoot.create(createProps);
    root.softDelete('admin-1');
    root.restore();

    expect(root.deleteAt).toBeNull();
    expect(root.deleteBy).toBeNull();
  });
});
