import { BaseAggregateRoot } from '../common';
import { RenewableUsageVO } from '../value-objects';
import { QuotaConsumedEvent, QuotaUsageResetEvent } from '../events';

export interface QuotaUsageProps {
  enterpriseId: string;
  cycleAnchorDate: Date;
  usages: RenewableUsageVO[];
  updatedAt: Date;
}

export class QuotaUsageRoot extends BaseAggregateRoot<QuotaUsageProps> {
  public static create(enterpriseId: string, cycleAnchorDate: Date): QuotaUsageRoot {
    const now = new Date();
    return new QuotaUsageRoot({
      enterpriseId,
      cycleAnchorDate,
      usages: [],
      updatedAt: now,
    });
  }

  public static instantiate(id: string, props: QuotaUsageProps): QuotaUsageRoot {
    return new QuotaUsageRoot(props, id);
  }

  private constructor(props: QuotaUsageProps, id?: string) {
    super(props, id);
  }

  get enterpriseId(): string {
    return this.props.enterpriseId;
  }

  get cycleAnchorDate(): Date {
    return this.props.cycleAnchorDate;
  }

  get usages(): RenewableUsageVO[] {
    return this.props.usages;
  }

  tryConsume(key: string, amount: number): { ok: boolean; overflow: number } {
    const index = this.props.usages.findIndex((u) => u.key === key);
    if (index === -1) {
      return { ok: false, overflow: amount };
    }
    const usage = this.props.usages[index];
    const newUsed = usage.used + amount;

    if (newUsed <= usage.allocated) {
      this.props.usages[index] = new RenewableUsageVO({
        ...usage.props,
        used: newUsed,
      });
      this.props.updatedAt = new Date();

      this.addDomainEvent(
        new QuotaConsumedEvent(this.id || this.enterpriseId, {
          enterpriseId: this.enterpriseId,
          key,
          consumedAmount: amount,
        })
      );
      return { ok: true, overflow: 0 };
    } else {
      const overflow = newUsed - usage.allocated;
      return { ok: false, overflow };
    }
  }

  recompute(
    renewableGrants: { key: string; value: number; resetCycle: 'monthly' | 'weekly' | 'daily' }[],
    newAnchorDate?: Date
  ): void {
    if (newAnchorDate) {
      this.props.cycleAnchorDate = newAnchorDate;
    }
    const now = new Date();
    const updatedUsages: RenewableUsageVO[] = [];

    for (const grant of renewableGrants) {
      const existing = this.props.usages.find((u) => u.key === grant.key);
      const cycleDates = this.calculateCycleDates(this.props.cycleAnchorDate, grant.resetCycle, now);

      if (existing) {
        updatedUsages.push(
          new RenewableUsageVO({
            key: grant.key,
            allocated: grant.value,
            used: existing.used,
            cycleStartAt: cycleDates.start,
            cycleEndsAt: cycleDates.end,
          })
        );
      } else {
        updatedUsages.push(
          new RenewableUsageVO({
            key: grant.key,
            allocated: grant.value,
            used: 0,
            cycleStartAt: cycleDates.start,
            cycleEndsAt: cycleDates.end,
          })
        );
      }
    }

    this.props.usages = updatedUsages;
    this.props.updatedAt = now;
  }

  resetExpiredCycles(now: Date): string[] {
    const resetKeys: string[] = [];
    for (let i = 0; i < this.props.usages.length; i++) {
      const u = this.props.usages[i];
      if (u.cycleEndsAt <= now) {
        const nextCycle = this.calculateCycleDates(u.cycleEndsAt, 'monthly', now); // default to monthly
        this.props.usages[i] = new RenewableUsageVO({
          key: u.key,
          allocated: u.allocated,
          used: 0,
          cycleStartAt: u.cycleEndsAt,
          cycleEndsAt: nextCycle.end,
        });
        resetKeys.push(u.key);
      }
    }
    if (resetKeys.length > 0) {
      this.props.updatedAt = now;
      this.addDomainEvent(
        new QuotaUsageResetEvent(this.id || this.enterpriseId, {
          enterpriseId: this.enterpriseId,
          resetKeys,
        })
      );
    }
    return resetKeys;
  }

  private calculateCycleDates(
    anchor: Date,
    cycle: 'monthly' | 'weekly' | 'daily',
    now: Date
  ): { start: Date; end: Date } {
    let start = new Date(anchor);
    while (true) {
      const next = new Date(start);
      if (cycle === 'monthly') next.setMonth(next.getMonth() + 1);
      else if (cycle === 'weekly') next.setDate(next.getDate() + 7);
      else next.setDate(next.getDate() + 1);

      if (next > now) {
        return { start, end: next };
      }
      start = next;
    }
  }
}
