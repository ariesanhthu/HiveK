import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { ERoleType } from '../enums';

export interface UserProps {
  email: string;
  phone: PhoneNumberVO;
  passwordHash: string;
  type: ERoleType;
  roleId: string;
  isEmailVerified: boolean;
  fullName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
  refreshToken: Nullable<string>;
  googleId: Nullable<string>;
}

export type UserCreateProps =
  & Omit<
    UserProps,
    | 'createdAt'
    | 'updatedAt'
    | 'deleteAt'
    | 'deleteBy'
    | 'refreshToken'
    | 'googleId'
    | 'isEmailVerified'
    | 'avatar'
  >
  & {
    googleId?: Nullable<string>;
    isEmailVerified?: boolean;
  };

export abstract class UserRoot<
  T extends UserProps = UserProps,
> extends BaseAggregateRoot<T> {
  protected constructor(props: T, id?: string) {
    super(props, id);
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): PhoneNumberVO {
    return this.props.phone;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get type(): ERoleType {
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

  get avatar(): string | undefined {
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

  get googleId(): Nullable<string> {
    return this.props.googleId;
  }

  public updateFullName(fullName: string): void {
    this.props.fullName = fullName;
    this.props.updatedAt = new Date();
  }

  public updateRefreshToken(token: Nullable<string>): void {
    this.props.refreshToken = token;
    this.props.updatedAt = new Date();
  }

  public updatePassword(passwordHash: string): void {
    this.props.passwordHash = passwordHash;
    this.props.updatedAt = new Date();
  }

  public updatePhone(phone: PhoneNumberVO): void {
    this.props.phone = phone;
    this.props.updatedAt = new Date();
  }

  public updateGoogleId(googleId: Nullable<string>): void {
    this.props.googleId = googleId;
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

  public verifyEmail(): void {
    this.props.isEmailVerified = true;
    this.props.updatedAt = new Date();
  }
}
