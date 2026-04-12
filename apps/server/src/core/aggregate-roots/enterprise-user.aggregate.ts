import { UserProps, UserRoot } from './user.aggregate';
import { UserType } from '../enums/user-type.enum';

export interface EnterpriseUserProps extends UserProps {
  enterpriseId: string;
}

export class EnterpriseUserRoot extends UserRoot<EnterpriseUserProps> {
  private constructor(props: EnterpriseUserProps, id?: string) {
    super(props, id);
  }

  public static create(props: EnterpriseUserProps): EnterpriseUserRoot {
    if (props.type !== UserType.ENTERPRISE) {
      throw new Error('Invalid user type for EnterpriseUserRoot');
    }
    return new EnterpriseUserRoot(props);
  }

  public static instantiate(id: string, props: EnterpriseUserProps): EnterpriseUserRoot {
    return new EnterpriseUserRoot(props, id);
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }
}
