import { PlatformRoot } from '@core/aggregate-roots/platform.aggregate';
import { PlatformApiStatus } from '@core/enums/platform-api-status.enum';

describe('PlatformRoot Aggregate Root', () => {
  const props = {
    name: 'YouTube',
    baseUrl: 'https://youtube.com',
    apiStatus: PlatformApiStatus.STABLE,
    icon: 'icon-youtube-id',
  };

  it('should create a PlatformRoot with lowercase name', () => {
    const root = PlatformRoot.create(props);

    expect(root).toBeDefined();
    expect(root.name).toBe('youtube'); // verified lowercase conversion
    expect(root.baseUrl).toBe(props.baseUrl);
    expect(root.apiStatus).toBe(props.apiStatus);
    expect(root.icon).toBe(props.icon);
  });

  it('should instantiate a PlatformRoot with id', () => {
    const root = PlatformRoot.instantiate('id-123', props);

    expect(root).toBeDefined();
    expect(root.id).toBe('id-123');
    expect(root.name).toBe(props.name); // instantiate does not change properties
  });

  it('should update api status and icon url correctly', () => {
    const root = PlatformRoot.create(props);

    root.updateApiStatus(PlatformApiStatus.MAINTENANCE);
    expect(root.apiStatus).toBe(PlatformApiStatus.MAINTENANCE);

    root.updateIcon('newicon-id');
    expect(root.icon).toBe('newicon-id');
  });
});
