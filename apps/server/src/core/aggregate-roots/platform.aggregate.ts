import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { PlatformApiStatus } from '../enums/platform-api-status.enum';
import { Nullable } from '@/core/types';

export interface PlatformProps {
  name: string;
  baseUrl: string;
  apiStatus: PlatformApiStatus;
  iconUrl: string;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformCreateProps {
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

  public static create(props: PlatformCreateProps): PlatformRoot {
    const now = new Date();
    return new PlatformRoot({
      ...props,
      name: props.name.toLowerCase(),
      createdAt: now,
      updatedAt: now,
      deleteAt: null,
      deleteBy: null,
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

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }

  public updateApiStatus(status: PlatformApiStatus): void {
    this.props.apiStatus = status;
  }

  public updateIconUrl(iconUrl: string): void {
    this.props.iconUrl = iconUrl;
  }
}
