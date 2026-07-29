import { BaseAggregateRoot } from '@/core/common/base.aggregate-root';
import { Nullable } from '@/core/types';
import { SocialPageConnectedEvent } from '../events/social-page-connected.domain-event';

export interface SocialPageProps {
  enterpriseId: string;
  platformId: string;
  platformCode: string;
  pageId: string;
  pageName: string;
  pictureUrl: Nullable<string>;
  followerCount: Nullable<number>;
  encryptedToken: string;
  tokenExpiresAt: Nullable<Date>;
  webhookVerifyToken: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deleteAt: Nullable<Date>;
  deleteBy: Nullable<string>;
}

export type SocialPageCreateProps = Omit<
  SocialPageProps,
  | 'pictureUrl'
  | 'followerCount'
  | 'tokenExpiresAt'
  | 'webhookVerifyToken'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
  | 'deleteAt'
  | 'deleteBy'
> & {
  pictureUrl?: Nullable<string>;
  followerCount?: Nullable<number>;
  tokenExpiresAt?: Nullable<Date>;
  webhookVerifyToken?: string;
};

export class SocialPageRoot extends BaseAggregateRoot<SocialPageProps> {
  private constructor(props: SocialPageProps, id?: string) {
    super(props, id);
  }

  public static create(
    props: SocialPageCreateProps,
    id?: string,
  ): SocialPageRoot {
    const now = new Date();
    // Generate a random UUID for the webhook verify token if not provided
    const verifyToken = props.webhookVerifyToken || this.generateUuid();

    const aggregate = new SocialPageRoot(
      {
        ...props,
        pictureUrl: props.pictureUrl || null,
        followerCount: props.followerCount || null,
        tokenExpiresAt: props.tokenExpiresAt || null,
        webhookVerifyToken: verifyToken,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        deleteAt: null,
        deleteBy: null,
      },
      id,
    );

    aggregate.addDomainEvent(
      new SocialPageConnectedEvent(aggregate.id, {
        socialPageId: aggregate.id,
        enterpriseId: props.enterpriseId,
        platformCode: props.platformCode,
        pageId: props.pageId,
        pageName: props.pageName,
      }),
    );

    return aggregate;
  }

  public static instantiate(
    id: string,
    props: SocialPageProps,
  ): SocialPageRoot {
    return new SocialPageRoot(props, id);
  }

  private static generateUuid(): string {
    const random = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join('');
    return `verify-${random}`;
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }
  get platformId(): string {
    return this.props.platformId;
  }
  get platformCode(): string {
    return this.props.platformCode;
  }
  get pageId(): string {
    return this.props.pageId;
  }
  get pageName(): string {
    return this.props.pageName;
  }
  get pictureUrl(): Nullable<string> {
    return this.props.pictureUrl;
  }
  get followerCount(): Nullable<number> {
    return this.props.followerCount;
  }
  get encryptedToken(): string {
    return this.props.encryptedToken;
  }
  get tokenExpiresAt(): Nullable<Date> {
    return this.props.tokenExpiresAt;
  }
  get webhookVerifyToken(): string {
    return this.props.webhookVerifyToken;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get deleteAt(): Nullable<Date> {
    return this.props.deleteAt;
  }
  get deleteBy(): Nullable<string> {
    return this.props.deleteBy;
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  public updateToken(
    encryptedToken: string,
    tokenExpiresAt: Nullable<Date> = null,
  ): void {
    this.props.encryptedToken = encryptedToken;
    this.props.tokenExpiresAt = tokenExpiresAt;
    this.props.updatedAt = new Date();
  }

  public updatePageInfo(
    pageName: string,
    pictureUrl: Nullable<string> = null,
    followerCount: Nullable<number> = null,
  ): void {
    this.props.pageName = pageName;
    if (pictureUrl !== null) this.props.pictureUrl = pictureUrl;
    if (followerCount !== null) this.props.followerCount = followerCount;
    this.props.updatedAt = new Date();
  }

  public softDelete(deletedBy: string): void {
    this.props.deleteAt = new Date();
    this.props.deleteBy = deletedBy;
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  public restore(): void {
    this.props.deleteAt = null;
    this.props.deleteBy = null;
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }
}
