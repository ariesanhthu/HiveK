import { UserProps, UserRoot, UserCreateProps } from './user.aggregate';
import { UserType } from '../enums/user-type.enum';

export interface KOLUserProps extends UserProps {
  phoneNumber?: string;
}

export interface KOLUserCreateProps extends UserCreateProps {
  phoneNumber?: string;
}

export class KOLUserRoot extends UserRoot<KOLUserProps> {
  private constructor(props: KOLUserProps, id?: string) {
    super(props, id);
  }

  public static create(props: KOLUserCreateProps): KOLUserRoot {
    if (props.type !== UserType.KOL) {
      throw new Error('Invalid user type for KOLUserRoot');
    }
    const now = new Date();
    return new KOLUserRoot({
      ...props,
      createdAt: now,
      updatedAt: now,
      deleteAt: null,
      deleteBy: null,
      refreshToken: null,
    });
  }

  public static instantiate(id: string, props: KOLUserProps): KOLUserRoot {
    return new KOLUserRoot(props, id);
  }

  get fullName(): string {
    return this.props.fullName;
  }
}
