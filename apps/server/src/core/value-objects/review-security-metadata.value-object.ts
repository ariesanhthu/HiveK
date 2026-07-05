import { BaseValueObject } from '../common/base.value-object';

export interface ReviewSecurityMetadataProps {
  ipHash: string;
  browserFingerprint: string;
  recaptchaScore: number;
}

export class ReviewSecurityMetadataVO extends BaseValueObject<ReviewSecurityMetadataProps> {
  private constructor(props: ReviewSecurityMetadataProps) {
    super(props);
  }

  public static create(props: ReviewSecurityMetadataProps): ReviewSecurityMetadataVO {
    if (!props.ipHash || props.ipHash.trim().length === 0) {
      throw new Error('IP hash is required');
    }
    if (!props.browserFingerprint || props.browserFingerprint.trim().length === 0) {
      throw new Error('Browser fingerprint is required');
    }
    if (props.recaptchaScore < 0 || props.recaptchaScore > 1) {
      throw new Error('reCAPTCHA score must be between 0 and 1');
    }
    return new ReviewSecurityMetadataVO(props);
  }

  get ipHash(): string {
    return this.props.ipHash;
  }

  get browserFingerprint(): string {
    return this.props.browserFingerprint;
  }

  get recaptchaScore(): number {
    return this.props.recaptchaScore;
  }

  /**
   * Check if the reCAPTCHA score is above the minimum threshold.
   */
  public isRecaptchaValid(threshold: number = 0.5): boolean {
    return this.props.recaptchaScore >= threshold;
  }
}
