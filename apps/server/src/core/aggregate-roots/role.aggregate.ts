import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';

export interface RoleProps {
  title: string;
  permissions: string[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type RoleCreateProps = Omit<RoleProps, 'createdAt' | 'updatedAt' | 'deleteAt' | 'deleteBy'>;

export class RoleRoot extends BaseAggregateRoot<RoleProps> {
  private constructor(props: RoleProps, id?: string) {
    super(props, id);
  }

  public static create(props: RoleCreateProps): RoleRoot {
    const now = new Date();
    return new RoleRoot({
      ...props,
      createdAt: now,
      updatedAt: now,
      deleteAt: null,
      deleteBy: null,
    });
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
