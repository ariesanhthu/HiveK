import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { EOtpType } from '../enums/otp-type.enum';
import { VerificationOtpCreatedEvent } from '../events/verification-otp-created.domain-event';

export interface OtpProps {
  email: string;
  code: string;
  type: EOtpType;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OtpCreateProps = Omit<OtpProps, 'createdAt' | 'updatedAt'>;

export class OtpRoot extends BaseAggregateRoot<OtpProps> {
  private constructor(props: OtpProps, id?: string) {
    super(props, id);
  }

  public static create(props: OtpCreateProps, id?: string): OtpRoot {
    const now = new Date();
    return new OtpRoot({
      ...props,
      createdAt: now,
      updatedAt: now,
    }, id);
  }

  public static instantiate(id: string, props: OtpProps): OtpRoot {
    return new OtpRoot(props, id);
  }

  public override setId(id: string): void {
    super.setId(id);
    this.addDomainEvent(
      new VerificationOtpCreatedEvent(
        this.id,
        {
          ...this.props,
        },
      ),
    );
  }

  get email(): string {
    return this.props.email;
  }

  get code(): string {
    return this.props.code;
  }

  get type(): EOtpType {
    return this.props.type;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }
}
