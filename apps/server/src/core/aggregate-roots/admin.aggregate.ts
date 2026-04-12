import { UserProps, UserRoot } from './user.aggregate';
import { UserType } from '../enums/user-type.enum';

export interface AdminProps extends UserProps {
}

export class AdminRoot extends UserRoot<AdminProps> {
  private constructor(props: AdminProps, id?: string) {
    super(props, id);
  }

  public static create(props: AdminProps): AdminRoot {
    if (props.type !== UserType.ADMIN) {
      throw new Error('Invalid user type for AdminRoot');
    }
    return new AdminRoot(props);
  }

  public static instantiate(id: string, props: AdminProps): AdminRoot {
    return new AdminRoot(props, id);
  }
}
