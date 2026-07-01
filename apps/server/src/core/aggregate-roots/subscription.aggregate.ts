import { BaseAggregateRoot } from '../common';
import { type ESubscriptionStatus } from '../enums';
import { QuotaVO, type SubscriptionItemVO, type SubscriptionChangeDetailsVO } from '../value-objects';
import { SubscriptionUpdatedEvent } from '../events/subscription-updated.domain-event';

export interface SubscriptionProps {
  enterpriseId: string;
  status: ESubscriptionStatus;
  items: SubscriptionItemVO[];
  computedQuotas: QuotaVO;
  computedPermissions: string[];
  version: number;
  nextExpiryCheckAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionCreateProps = Omit<SubscriptionProps, 'createdAt' | 'updatedAt' | 'version'> & {
  version?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export class SubscriptionEntity extends BaseAggregateRoot<SubscriptionProps> {
  public static create(input: SubscriptionCreateProps, id?: string): SubscriptionEntity {
    const now = new Date();
    return new SubscriptionEntity(
      {
        enterpriseId: input.enterpriseId,
        status: input.status,
        items: input.items,
        computedQuotas: input.computedQuotas,
        computedPermissions: input.computedPermissions,
        version: input.version ?? 1,
        nextExpiryCheckAt: input.nextExpiryCheckAt,
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
      },
      id
    );
  }

  public static instantiate(id: string, props: SubscriptionProps): SubscriptionEntity {
    return new SubscriptionEntity(props, id);
  }

  private constructor(props: SubscriptionProps, id?: string) {
    super(props, id);
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get status(): ESubscriptionStatus {
    return this.props.status;
  }

  get items(): SubscriptionItemVO[] {
    return this.props.items;
  }

  get computedQuotas(): QuotaVO {
    return this.props.computedQuotas;
  }

  get computedPermissions(): string[] {
    return this.props.computedPermissions;
  }

  get version(): number {
    return this.props.version;
  }

  get nextExpiryCheckAt(): Date {
    return this.props.nextExpiryCheckAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business methods for package management
  addPackage(item: SubscriptionItemVO): boolean {
    const exists = this.props.items.some((i) => i.packageId === item.packageId);
    if (exists) return false;

    this.props.items.push(item);
    this.props.updatedAt = new Date();
    return true;
  }

  removePackage(packageId: string): boolean {
    const index = this.props.items.findIndex((i) => i.packageId === packageId);
    if (index === -1) return false;

    this.props.items.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  updateComputedFields(quotas: QuotaVO, permissions: string[]): void {
    this.props.computedQuotas = quotas;
    this.props.computedPermissions = permissions;
    this.props.updatedAt = new Date();
  }

  clear(): void {
    this.props.items = [];
    this.props.computedQuotas = new QuotaVO({});
    this.props.computedPermissions = [];
    this.props.updatedAt = new Date();
  }

  recordSubscriptionUpdated(
    subscriptionHistoryId: string,
    details: SubscriptionChangeDetailsVO
  ): void {
    this.addDomainEvent(
      new SubscriptionUpdatedEvent(
        this.enterpriseId,
        subscriptionHistoryId,
        details
      )
    );
  }
}
