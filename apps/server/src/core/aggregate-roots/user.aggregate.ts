import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { UserType } from '../enums/user-type.enum';
import { Nullable } from '@/core/types';

export interface UserProps {
  email: string;
  phone: string;
  passwordHash: string;
  type: UserType;
  roleId: string;
  isEmailVerified: boolean;
  fullName: string;
  avatar: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  refreshToken: Nullable<string>;
}

export type UserCreateProps = Omit<UserProps, 'createdAt' | 'updatedAt' | 'deleteAt' | 'deleteBy' | 'refreshToken'>;

export abstract class UserRoot<T extends UserProps = UserProps> extends BaseAggregateRoot<T> {
  protected constructor(props: T, id?: string) {
    super(props, id);
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get type(): UserType {
    return this.props.type;
  }

  get roleId(): string {
    return this.props.roleId;
  }

  get isEmailVerified(): boolean {
    return this.props.isEmailVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get fullName(): string {
    return this.props.fullName;
  }

  get avatar(): Nullable<string> {
    return this.props.avatar;
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  get refreshToken(): Nullable<string> {
    return this.props.refreshToken;
  }

  public updateRefreshToken(token: Nullable<string>): void {
    this.props.refreshToken = token;
    this.props.updatedAt = new Date();
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }
}
