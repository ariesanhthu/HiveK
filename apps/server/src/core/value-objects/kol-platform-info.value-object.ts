import { BaseValueObject } from '../common/base.value-object';

export interface KolPlatformInfoProps {
  platformId: string;
  uniqueId: string;
  externalId: string;
  followerCount: number;
  avgEngagement: number;
  topTags: string[];
  categories: string[];
}

/**
 * Value object representing influencer data on a specific social platform.
 */
export class KolPlatformInfoVO extends BaseValueObject<KolPlatformInfoProps> {
  private constructor(props: KolPlatformInfoProps) {
    super(props);
  }

  public static create(props: KolPlatformInfoProps): KolPlatformInfoVO {
    // Add validation if needed
    return new KolPlatformInfoVO(props);
  }

  get platformId(): string {
    return this.props.platformId;
  }

  get uniqueId(): string {
    return this.props.uniqueId;
  }

  get externalId(): string {
    return this.props.externalId;
  }

  get followerCount(): number {
    return this.props.followerCount;
  }

  get avgEngagement(): number {
    return this.props.avgEngagement;
  }

  get topTags(): string[] {
    return this.props.topTags;
  }

  get categories(): string[] {
    return this.props.categories;
  }
}
