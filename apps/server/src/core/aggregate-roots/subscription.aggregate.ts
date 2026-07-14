import { BaseAggregateRoot } from '../common';
import { type ESubscriptionStatus, EGrantType } from '../enums';
import {
  GrantVO,
  PlanItemVO,
  AddonItemVO,
  type SubscriptionChangeDetailsVO
} from '../value-objects';
import { SubscriptionUpdatedEvent } from '../events/subscription-updated.domain-event';

export interface SubscriptionProps {
  enterpriseId: string;
  status: ESubscriptionStatus;
  planItem: PlanItemVO | null;
  addonItems: AddonItemVO[];
  computedGrants: GrantVO[];
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

export class SubscriptionRoot extends BaseAggregateRoot<SubscriptionProps> {
  public static create(input: SubscriptionCreateProps, id?: string): SubscriptionRoot {
    const now = new Date();
    return new SubscriptionRoot(
      {
        enterpriseId: input.enterpriseId,
        status: input.status,
        planItem: input.planItem,
        addonItems: input.addonItems,
        computedGrants: input.computedGrants,
        computedPermissions: input.computedPermissions,
        version: input.version ?? 1,
        nextExpiryCheckAt: input.nextExpiryCheckAt,
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
      },
      id
    );
  }

  public static instantiate(id: string, props: SubscriptionProps): SubscriptionRoot {
    return new SubscriptionRoot(props, id);
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

  get planItem(): PlanItemVO | null {
    return this.props.planItem;
  }

  get addonItems(): AddonItemVO[] {
    return this.props.addonItems;
  }

  get computedGrants(): GrantVO[] {
    return this.props.computedGrants;
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

  public attachPlan(item: PlanItemVO): void {
    this.props.planItem = item;
    this.props.updatedAt = new Date();
  }

  public expirePlan(): void {
    this.props.planItem = null;
    this.props.updatedAt = new Date();
  }

  public attachAddon(item: AddonItemVO): boolean {
    const exists = this.props.addonItems.some((i) => i.packageVariantId === item.packageVariantId);
    if (exists) return false;

    this.props.addonItems.push(item);
    this.props.updatedAt = new Date();
    return true;
  }

  public removeAddon(packageVariantId: string): boolean {
    const index = this.props.addonItems.findIndex((i) => i.packageVariantId === packageVariantId);
    if (index === -1) return false;

    this.props.addonItems.splice(index, 1);
    this.props.updatedAt = new Date();
    return true;
  }

  public updateComputedFields(grants: GrantVO[], permissions: string[]): void {
    this.props.computedGrants = grants;
    this.props.computedPermissions = permissions;
    this.props.updatedAt = new Date();
  }

  public clear(): void {
    this.props.planItem = null;
    this.props.addonItems = [];
    this.props.computedGrants = [];
    this.props.computedPermissions = [];
    this.props.updatedAt = new Date();
  }

  public recomputeGrants(planGrants: GrantVO[], addonsGrants: Map<string, GrantVO[]>): void {
    const grantsMap = new Map<string, GrantVO>();
    const permissionsSet = new Set<string>();

    const processGrantsList = (grants: GrantVO[], isPlan: boolean) => {
      for (const grant of grants) {
        if (grant.type === EGrantType.PERMISSION) {
          permissionsSet.add(grant.key);
        } else if (grant.type === EGrantType.QUOTA_HARD || grant.type === EGrantType.QUOTA_RENEWABLE) {
          const existing = grantsMap.get(grant.key);
          if (existing) {
            const newValue = existing.value + grant.value;
            // Plan creditFallback takes precedence over add-on fallback
            const fallback = isPlan
              ? (grant.creditFallback !== undefined ? grant.creditFallback : existing.creditFallback)
              : (existing.creditFallback !== undefined ? existing.creditFallback : grant.creditFallback);
            
            grantsMap.set(grant.key, new GrantVO({
              ...existing.props,
              value: newValue,
              creditFallback: fallback
            }));
          } else {
            grantsMap.set(grant.key, grant);
          }
        }
      }
    };

    // 1. Process Plan Grants
    if (this.props.planItem) {
      processGrantsList(planGrants, true);
    }

    // 2. Process Addon Grants
    for (const addon of this.props.addonItems) {
      const grants = addonsGrants.get(addon.packageVariantId) || [];
      processGrantsList(grants, false);
    }

    this.props.computedGrants = Array.from(grantsMap.values());
    this.props.computedPermissions = Array.from(permissionsSet);
    this.props.updatedAt = new Date();
  }

  public recordSubscriptionUpdated(
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
