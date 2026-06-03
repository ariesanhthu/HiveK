import { UserProps, UserRoot, UserCreateProps } from './user.aggregate';
import { ERoleType } from '../enums';

export interface EnterpriseUserProps extends UserProps {
  enterpriseId: string;
}

export interface EnterpriseUserCreateProps extends UserCreateProps {
  enterpriseId: string;
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

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }
}
