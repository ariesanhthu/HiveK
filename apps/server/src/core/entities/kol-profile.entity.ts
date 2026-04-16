import { BaseEntity } from '../common/base.entity';
import { KolPlatformInfo } from '../value-objects/kol-platform-info.value-object';

export interface KolProfileProps {
  name: string;
  location: string;
  gender: string;
  bio: string;
  email: string; // Flattened contact
  phone: string; // Flattened contact
  platforms: KolPlatformInfo[];
  isVerified: boolean;
}

/**
 * Entity representing an Influencer/KOL Profile.
 * This corresponds to the 'influencers' collection in the database.
 */
export class KolProfileEntity extends BaseEntity<KolProfileProps> {
  private constructor(props: KolProfileProps, id?: string) {
    super(props, id);
  }

  public static create(props: KolProfileProps, id?: string): KolProfileEntity {
    return new KolProfileEntity(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get location(): string {
    return this.props.location;
  }

  get gender(): string {
    return this.props.gender;
  }

  get bio(): string {
    return this.props.bio;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string {
    return this.props.phone;
  }

  get platforms(): KolPlatformInfo[] {
    return this.props.platforms;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }
}
