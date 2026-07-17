import { UserProps, UserRoot, UserCreateProps } from './user.aggregate';
import { ERoleType } from '../enums';
import { InvalidUserTypeException } from '../exceptions';
import { UserSignedUpEvent, UserAddedToEnterpriseEvent, UserRevokedFromEnterpriseEvent } from '../events';

export interface EnterpriseUserProps extends UserProps {
  enterpriseIds: string[];
}

export interface EnterpriseUserCreateProps extends UserCreateProps {
}

export class EnterpriseUserRoot extends UserRoot<EnterpriseUserProps> {
  private constructor(props: EnterpriseUserProps, id?: string) {
    super(props, id);
  }

  public override setId(id: string): void {
    super.setId(id);
    this.addDomainEvent(new UserSignedUpEvent(
      this.id,
      {
        email: this.props.email,
        fullName: this.props.fullName,
        phone: this.props.phone?.value,
        type: ERoleType.ENTERPRISE,
      },
    ));
  }

  public static create(props: EnterpriseUserCreateProps): EnterpriseUserRoot {
    if (props.type !== ERoleType.ENTERPRISE) {
      throw new InvalidUserTypeException('Invalid user type for EnterpriseUserRoot');
    }
    const now = new Date();
    return new EnterpriseUserRoot({
      ...props,
      isEmailVerified: props.isEmailVerified ?? false,
      enterpriseIds: [],
      googleId: props.googleId || null,
      createdAt: now,
      updatedAt: now,
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
    });
  }

  public static instantiate(id: string, props: EnterpriseUserProps): EnterpriseUserRoot {
    return new EnterpriseUserRoot(props, id);
  }

  get enterpriseIds(): string[] {
    return [...this.props.enterpriseIds];
  }

  public addEnterprise(enterpriseId: string, enterpriseName?: string): void {
    if (this.props.enterpriseIds.includes(enterpriseId)) {
      return; // Or throw an error if you prefer strictness
    }
    this.props.enterpriseIds.push(enterpriseId);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserAddedToEnterpriseEvent(
      this.id!,
      {
        userId: this.id!,
        userEmail: this.email,
        enterpriseId,
        enterpriseName,
      }
    ));
  }

  public revokeEnterprise(enterpriseId: string, enterpriseName?: string): void {
    if (!this.props.enterpriseIds.includes(enterpriseId)) {
      return;
    }
    this.props.enterpriseIds = this.props.enterpriseIds.filter(id => id !== enterpriseId);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new UserRevokedFromEnterpriseEvent(
      this.id!,
      {
        userId: this.id!,
        userEmail: this.email,
        enterpriseId,
        enterpriseName,
      }
    ));
  }
}
