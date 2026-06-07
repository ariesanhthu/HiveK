import { UserProps, UserRoot, UserCreateProps } from './user.aggregate';
import { ERoleType } from '../enums';
import { Nullable } from '../types';

export interface EnterpriseUserProps extends UserProps {
  enterpriseIds: string[];
}

export interface EnterpriseUserCreateProps extends UserCreateProps {
}

export class EnterpriseUserRoot extends UserRoot<EnterpriseUserProps> {
  private constructor(props: EnterpriseUserProps, id?: string) {
    super(props, id);
  }

  public static create(props: EnterpriseUserCreateProps): EnterpriseUserRoot {
    if (props.type !== ERoleType.ENTERPRISE) {
      throw new Error('Invalid user type for EnterpriseUserRoot');
    }
    const now = new Date();
    return new EnterpriseUserRoot({
      ...props,
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

  public addEnterprise(enterpriseId: string): void {
    if (!this.props.enterpriseIds.includes(enterpriseId)) {
      this.props.enterpriseIds.push(enterpriseId);
      this.props.updatedAt = new Date();
    }
  }

  public revokeEnterprise(enterpriseId: string): void {
    this.props.enterpriseIds = this.props.enterpriseIds.filter(id => id !== enterpriseId);
    this.props.updatedAt = new Date();
  }
}
