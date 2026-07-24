import { ERoleType } from '../enums';
import { UserCreateProps, UserProps, UserRoot } from './user.aggregate';

export type AdminProps = UserProps;

export type AdminCreateProps = UserCreateProps;

export class AdminRoot extends UserRoot<AdminProps> {
  private constructor(props: AdminProps, id?: string) {
    super(props, id);
  }

  public static create(props: AdminCreateProps): AdminRoot {
    if (props.type !== ERoleType.ADMIN) {
      throw new Error('Invalid user type for AdminRoot');
    }
    const now = new Date();
    return new AdminRoot({
      ...props,
      isEmailVerified: false,
      googleId: props.googleId || null,
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
