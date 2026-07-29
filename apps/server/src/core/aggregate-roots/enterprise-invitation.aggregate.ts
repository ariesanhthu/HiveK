import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { EEnterpriseMemberMode, EEnterpriseInvitationStatus } from '../enums';
import { InvalidOperationException } from '../exceptions';

export interface EnterpriseInvitationProps {
  enterpriseId: string;
  email: string;
  mode: EEnterpriseMemberMode;
  inviterId: string;
  status: EEnterpriseInvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type EnterpriseInvitationCreateProps = Omit<
  EnterpriseInvitationProps,
  'createdAt' | 'updatedAt' | 'status'
> & {
  status?: EEnterpriseInvitationStatus;
};

export class EnterpriseInvitationRoot extends BaseAggregateRoot<EnterpriseInvitationProps> {
  private constructor(props: EnterpriseInvitationProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: EnterpriseInvitationCreateProps,
    id?: string,
  ): EnterpriseInvitationRoot {
    const now = new Date();
    return new EnterpriseInvitationRoot(
      {
        ...props,
        status: props.status ?? EEnterpriseInvitationStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      },
      id,
    );
  }

  public static instantiate(
    id: string,
    props: EnterpriseInvitationProps,
  ): EnterpriseInvitationRoot {
    return new EnterpriseInvitationRoot(props, id);
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get email(): string {
    return this.props.email;
  }

  get mode(): EEnterpriseMemberMode {
    return this.props.mode;
  }

  get inviterId(): string {
    return this.props.inviterId;
  }

  get status(): EEnterpriseInvitationStatus {
    return this.props.status;
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

  public accept(): void {
    if (this.props.status !== EEnterpriseInvitationStatus.PENDING) {
      throw new InvalidOperationException('Invitation is not pending');
    }
    if (this.isExpired()) {
      this.props.status = EEnterpriseInvitationStatus.EXPIRED;
      this.props.updatedAt = new Date();
      throw new InvalidOperationException('Invitation has expired');
    }
    this.props.status = EEnterpriseInvitationStatus.ACCEPTED;
    this.props.updatedAt = new Date();
  }

  public revoke(): void {
    if (this.props.status !== EEnterpriseInvitationStatus.PENDING) {
      throw new InvalidOperationException('Invitation is not pending');
    }
    this.props.status = EEnterpriseInvitationStatus.REVOKED;
    this.props.updatedAt = new Date();
  }
}
