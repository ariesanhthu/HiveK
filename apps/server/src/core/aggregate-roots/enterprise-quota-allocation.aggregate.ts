import { BaseAggregateRoot } from '../common';
import { EnterpriseQuotaAllocationVO, type GrantVO } from '../value-objects';
import { EGrantType } from '../enums';

export interface EnterpriseQuotaAllocationRootProps {
  ownerId: string;
  allocations: EnterpriseQuotaAllocationVO[];
  updatedAt: Date;
}

export class EnterpriseQuotaAllocationRoot extends BaseAggregateRoot<EnterpriseQuotaAllocationRootProps> {
  public static create(ownerId: string): EnterpriseQuotaAllocationRoot {
    return new EnterpriseQuotaAllocationRoot({
      ownerId,
      allocations: [],
      updatedAt: new Date(),
    });
  }

  public static instantiate(id: string, props: EnterpriseQuotaAllocationRootProps): EnterpriseQuotaAllocationRoot {
    return new EnterpriseQuotaAllocationRoot(props, id);
  }

  private constructor(props: EnterpriseQuotaAllocationRootProps, id?: string) {
    super(props, id);
  }

  get ownerId(): string {
    return this.props.ownerId;
  }

  get allocations(): EnterpriseQuotaAllocationVO[] {
    return [...this.props.allocations];
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Move `amount` from the unallocated pool to a specific enterprise for a given key+kind.
   * Returns false if the pool doesn't have enough balance.
   */
  public allocate(enterpriseId: string, key: string, amount: number, kind: EGrantType): boolean {
    const poolBalance = this.getPoolBalance(key, kind);
    if (poolBalance < amount) return false;

    this.removeFromPool(key, kind, amount);
    this.addToEnterprise(enterpriseId, key, amount, kind);
    this.props.updatedAt = new Date();
    return true;
  }

  /**
   * Move `amount` from an enterprise back to the unallocated pool.
   */
  public deallocate(enterpriseId: string, key: string, amount: number, kind: EGrantType): void {
    this.removeFromEnterprise(enterpriseId, key, amount, kind);
    this.addToPool(key, amount, kind);
    this.props.updatedAt = new Date();
  }

  /**
   * Set a specific enterprise's allocation for a key+kind to an exact amount.
   * Adjusts the pool accordingly.
   */
  public setAllocationForEnterprise(enterpriseId: string, key: string, kind: EGrantType, amount: number): void {
    const current = this.getAllocationForEnterprise(enterpriseId, key, kind);
    const diff = amount - current;

    // Remove current enterprise allocation
    this.removeAllFromEnterprise(enterpriseId, key, kind);

    // Add the new amount to enterprise
    this.addToEnterprise(enterpriseId, key, amount, kind);

    // Adjust pool by the diff (negative diff means pool gains)
    if (diff < 0) {
      this.addToPool(key, Math.abs(diff), kind);
    } else {
      this.removeFromPool(key, kind, diff);
    }

    this.props.updatedAt = new Date();
  }

  /**
   * Rebuild allocations from the subscription's computed grants.
   * - Resets the pool to 100% of new grants
   * - Preserves existing enterprise allocations if they fit within the new total
   * - Puts remainder in pool
   */
  public rebalanceFromSubscription(computedGrants: GrantVO[], enterpriseIds: string[]): void {
    const divisibleKinds = [EGrantType.QUOTA_RENEWABLE, EGrantType.QUOTA_HARD, EGrantType.CREDIT_TOP_UP];

    for (const grant of computedGrants) {
      if (!divisibleKinds.includes(grant.type)) continue;

      const key = grant.key;
      const kind = grant.type;
      const total = grant.value;

      // Sum existing enterprise allocations for this key+kind
      let existingTotal = 0;
      const existingAllocs: { enterpriseId: string; amount: number }[] = [];

      for (const eid of enterpriseIds) {
        const current = this.getAllocationForEnterprise(eid, key, kind);
        if (current > 0) {
          existingTotal += current;
          existingAllocs.push({ enterpriseId: eid, amount: current });
        }
      }

      // Remove all existing allocations for this key+kind (enterprise + pool)
      this.removeAllForKeyKind(key, kind);

      // If existing allocations fit within the new total, preserve them
      if (existingTotal <= total) {
        for (const alloc of existingAllocs) {
          this.addToEnterprise(alloc.enterpriseId, key, alloc.amount, kind);
        }
        // Put remainder in pool
        const poolAmount = total - existingTotal;
        if (poolAmount > 0) {
          this.addToPool(key, poolAmount, kind);
        }
      } else {
        // Existing allocations exceed new total — scale proportionally
        for (const alloc of existingAllocs) {
          const scaled = Math.floor((alloc.amount / existingTotal) * total);
          if (scaled > 0) {
            this.addToEnterprise(alloc.enterpriseId, key, scaled, kind);
          }
        }
        // No pool (all consumed by enterprises)
      }
    }

    this.props.updatedAt = new Date();
  }

  public getAllocationForEnterprise(enterpriseId: string, key: string, kind: EGrantType): number {
    const alloc = this.props.allocations.find(
      (a) => !a.isPool && a.enterpriseId === enterpriseId && a.key === key && a.kind === kind
    );
    return alloc ? alloc.allocated : 0;
  }

  public getPoolBalance(key: string, kind: EGrantType): number {
    const pool = this.props.allocations.find((a) => a.isPool && a.key === key && a.kind === kind);
    return pool ? pool.allocated : 0;
  }

  public getAllocationsByEnterprise(enterpriseId: string): EnterpriseQuotaAllocationVO[] {
    return this.props.allocations.filter((a) => !a.isPool && a.enterpriseId === enterpriseId);
  }

  // ─── Private helpers ──────────────────────────────────────

  private addToEnterprise(enterpriseId: string, key: string, amount: number, kind: EGrantType): void {
    const existing = this.props.allocations.find(
      (a) => !a.isPool && a.enterpriseId === enterpriseId && a.key === key && a.kind === kind
    );
    if (existing) {
      const idx = this.props.allocations.indexOf(existing);
      this.props.allocations[idx] = new EnterpriseQuotaAllocationVO({
        ...existing.props,
        allocated: existing.allocated + amount,
      });
    } else {
      this.props.allocations.push(
        new EnterpriseQuotaAllocationVO({
          ownerId: this.props.ownerId,
          enterpriseId,
          key,
          allocated: amount,
          kind,
          isPool: false,
        })
      );
    }
  }

  private removeFromEnterprise(enterpriseId: string, key: string, amount: number, kind: EGrantType): void {
    const existing = this.props.allocations.find(
      (a) => !a.isPool && a.enterpriseId === enterpriseId && a.key === key && a.kind === kind
    );
    if (!existing) return;

    const newAmount = existing.allocated - amount;
    if (newAmount <= 0) {
      this.props.allocations = this.props.allocations.filter((a) => a !== existing);
    } else {
      const idx = this.props.allocations.indexOf(existing);
      this.props.allocations[idx] = new EnterpriseQuotaAllocationVO({
        ...existing.props,
        allocated: newAmount,
      });
    }
  }

  private removeAllFromEnterprise(enterpriseId: string, key: string, kind: EGrantType): void {
    this.props.allocations = this.props.allocations.filter(
      (a) => !(a.isPool === false && a.enterpriseId === enterpriseId && a.key === key && a.kind === kind)
    );
  }

  private addToPool(key: string, amount: number, kind: EGrantType): void {
    const existing = this.props.allocations.find((a) => a.isPool && a.key === key && a.kind === kind);
    if (existing) {
      const idx = this.props.allocations.indexOf(existing);
      this.props.allocations[idx] = new EnterpriseQuotaAllocationVO({
        ...existing.props,
        allocated: existing.allocated + amount,
      });
    } else {
      this.props.allocations.push(
        new EnterpriseQuotaAllocationVO({
          ownerId: this.props.ownerId,
          enterpriseId: '',
          key,
          allocated: amount,
          kind,
          isPool: true,
        })
      );
    }
  }

  private removeFromPool(key: string, kind: EGrantType, amount: number): void {
    const existing = this.props.allocations.find((a) => a.isPool && a.key === key && a.kind === kind);
    if (!existing) return;

    const newAmount = existing.allocated - amount;
    if (newAmount <= 0) {
      this.props.allocations = this.props.allocations.filter((a) => a !== existing);
    } else {
      const idx = this.props.allocations.indexOf(existing);
      this.props.allocations[idx] = new EnterpriseQuotaAllocationVO({
        ...existing.props,
        allocated: newAmount,
      });
    }
  }

  private removeAllForKeyKind(key: string, kind: EGrantType): void {
    this.props.allocations = this.props.allocations.filter(
      (a) => !(a.key === key && a.kind === kind)
    );
  }
}