import { Nullable } from '@/core/types';
import { BaseEntity } from '../common/base.entity';
import { KolPlatformInfoVO } from '../value-objects/kol-platform-info.value-object';

export interface KolProfileProps {
  userId: Nullable<string>;
  verificationType: Nullable<string>;
  name: string;
  location?: string;
  gender?: string;
  bio?: string;
  email: string; // Flattened contact
  phone?: string; // Flattened contact
  platforms: KolPlatformInfoVO[];
  isVerified: boolean;
  scores?: Record<string, any>;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type KolProfileCreateProps = Omit<
  KolProfileProps,
  'deleteAt' | 'deleteBy'
>;

/**
 * Entity representing an Influencer/KOL Profile.
 * This corresponds to the 'influencers' collection in the database.
 */
export class KolProfileEntity extends BaseEntity<KolProfileProps> {
  private constructor(props: KolProfileProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: KolProfileCreateProps,
    id?: string,
  ): KolProfileEntity {
    return new KolProfileEntity(
      {
        ...props,
        deleteAt: null,
        deleteBy: null,
      },
      id,
    );
  }

  public static instantiate(
    id: string,
    props: KolProfileProps,
  ): KolProfileEntity {
    return new KolProfileEntity(props, id);
  }

  get userId(): Nullable<string> {
    return this.props.userId;
  }

  get verificationType(): Nullable<string> {
    return this.props.verificationType;
  }

  get name(): string {
    return this.props.name;
  }

  get location(): string | undefined {
    return this.props.location;
  }

  get gender(): string | undefined {
    return this.props.gender;
  }

  get bio(): string | undefined {
    return this.props.bio;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get platforms(): KolPlatformInfoVO[] {
    return this.props.platforms;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get scores(): Record<string, any> {
    return this.props.scores || {};
  }

  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }

  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  public linkUser(userId: string, verificationType: string): void {
    this.props.userId = userId;
    this.props.verificationType = verificationType;
    this.props.isVerified = true;
  }

  public addPlatform(platform: KolPlatformInfoVO): void {
    if (!this.props.platforms) {
      this.props.platforms = [];
    }
    const exists = this.props.platforms.some(
      (p) =>
        p.platformId === platform.platformId
        && p.externalId === platform.externalId,
    );
    if (!exists) {
      this.props.platforms.push(platform);
    }
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
  }
}
