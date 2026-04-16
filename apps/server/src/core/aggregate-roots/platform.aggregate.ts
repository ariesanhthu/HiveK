import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { PlatformApiStatus } from '../enums/platform-api-status.enum';

export interface PlatformProps {
  name: string;
  baseUrl: string;
  apiStatus: PlatformApiStatus;
  iconUrl: string;
}

/**
 * Aggregate root for social media platforms supported by the system.
 */
export class PlatformRoot extends BaseAggregateRoot<PlatformProps> {
  private constructor(props: PlatformProps, id?: string) {
    super(props, id);
  }

  public static create(props: PlatformProps): PlatformRoot {
    return new PlatformRoot({
      ...props,
      name: props.name.toLowerCase()
    });
  }

  public static instantiate(id: string, props: PlatformProps): PlatformRoot {
    return new PlatformRoot(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get baseUrl(): string {
    return this.props.baseUrl;
  }

  get apiStatus(): PlatformApiStatus {
    return this.props.apiStatus;
  }

  get iconUrl(): string {
    return this.props.iconUrl;
  }

  public updateApiStatus(status: PlatformApiStatus): void {
    this.props.apiStatus = status;
  }

  public updateIconUrl(iconUrl: string): void {
    this.props.iconUrl = iconUrl;
  }
}
