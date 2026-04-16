import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { UserType } from '../enums/user-type.enum';

export interface UserProps {
  email: string;
  phone: string;
  passwordHash: string;
  type: UserType;
  roleId: string;
  isEmailVerified: boolean;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
}

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
}
