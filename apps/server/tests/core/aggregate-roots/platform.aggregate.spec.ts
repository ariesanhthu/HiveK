import { PlatformRoot } from '@core/aggregate-roots/platform.aggregate';
import { PlatformApiStatus } from '@core/enums/platform-api-status.enum';

describe('PlatformRoot Aggregate Root', () => {
  const createProps = {
    name: 'YouTube',
    baseUrl: 'https://youtube.com',
    apiStatus: PlatformApiStatus.STABLE,
  };

  const fullProps = {
    name: 'YouTube',
    baseUrl: 'https://youtube.com',
    apiStatus: PlatformApiStatus.STABLE,
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

    root.updateApiStatus(PlatformApiStatus.MAINTENANCE);
    expect(root.apiStatus).toBe(PlatformApiStatus.MAINTENANCE);

    root.updateIcon('newicon-id');
    expect(root.icon).toBe('newicon-id');
  });
});
