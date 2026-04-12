import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';

export interface RoleProps {
  title: string;
  permissions: string[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RoleRoot extends BaseAggregateRoot<RoleProps> {
  private constructor(props: RoleProps, id?: string) {
    super(props, id);
  }

  public static create(props: RoleProps): RoleRoot {
    return new RoleRoot(props);
  }

  public static instantiate(id: string, props: RoleProps): RoleRoot {
    return new RoleRoot(props, id);
  }

  get title(): string {
    return this.props.title;
  }

  get permissions(): string[] {
    return this.props.permissions;
  }

  get isBlocked(): boolean {
    return this.props.isBlocked;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public block(): void {
    this.props.isBlocked = true;
    this.props.updatedAt = new Date();
  }

  public unblock(): void {
    this.props.isBlocked = false;
    this.props.updatedAt = new Date();
  }

  public updatePermissions(permissions: string[]): void {
    this.props.permissions = permissions;
    this.props.updatedAt = new Date();
  }
}
