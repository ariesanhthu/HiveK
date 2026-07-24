import { ERoleType } from '../enums';
import { UserSignedUpEvent } from '../events/user-signed-up.domain-event';
import { UserCreateProps, UserProps, UserRoot } from './user.aggregate';

export type KOLUserProps = UserProps;

export type KOLUserCreateProps = UserCreateProps;

export class KOLUserRoot extends UserRoot<KOLUserProps> {
  private constructor(props: KOLUserProps, id?: string) {
    super(props, id);
  }

  public override setId(id: string): void {
    super.setId(id);
    this.addDomainEvent(
      new UserSignedUpEvent(this.id, {
        email: this.props.email,
        fullName: this.props.fullName,
        phone: this.props.phone?.value,
        type: this.props.type,
      }),
    );
  }

  public static create(props: KOLUserCreateProps): KOLUserRoot {
    if (props.type !== ERoleType.KOL) {
      throw new Error('Invalid user type for KOLUserRoot');
    }
    const now = new Date();
    return new KOLUserRoot({
      ...props,
      isEmailVerified: props.isEmailVerified ?? false,
      googleId: props.googleId || null,
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
}
