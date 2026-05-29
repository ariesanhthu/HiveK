import { UserProps, UserRoot, UserCreateProps } from './user.aggregate';
import { UserType } from '../enums/user-type.enum';

export interface AdminProps extends UserProps {
}

export interface AdminCreateProps extends UserCreateProps {
}

export class AdminRoot extends UserRoot<AdminProps> {
  private constructor(props: AdminProps, id?: string) {
    super(props, id);
  }

  public static create(props: AdminCreateProps): AdminRoot {
    if (props.type !== UserType.ADMIN) {
      throw new Error('Invalid user type for AdminRoot');
    }
    const now = new Date();
    return new AdminRoot({
      ...props,
      createdAt: now,
      updatedAt: now,
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
    });
  }

  public static instantiate(id: string, props: AdminProps): AdminRoot {
    return new AdminRoot(props, id);
  }
}
