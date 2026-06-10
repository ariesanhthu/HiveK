import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';
import { ERoleType } from '../enums';

export interface RoleProps {
  title: string;
  permissions: string[];
  type: ERoleType;
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

  get type(): ERoleType {
    return this.props.type;
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }

  public update(props: { title?: string; permissions?: string[]; type?: ERoleType }): void {
    if (props.title !== undefined) this.props.title = props.title;
    if (props.permissions !== undefined) this.props.permissions = props.permissions;
    if (props.type !== undefined) this.props.type = props.type;
    this.props.updatedAt = new Date();
  }

  public updatePermissions(permissions: string[]): void {
    this.props.permissions = permissions;
    this.props.updatedAt = new Date();
  }
}
