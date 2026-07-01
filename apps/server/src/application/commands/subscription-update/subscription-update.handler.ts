import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionUpdateCommand } from './subscription-update.command';
import { SUBSCRIPTION_REPOSITORY, type ISubscriptionRepository } from '@/core/interfaces/repositories';
import { SUBSCRIPTION_HISTORY_REPOSITORY, type ISubscriptionHistoryRepository } from '@/core/interfaces/repositories';
import { BILL_REPOSITORY, type IBillRepository } from '@/core/interfaces/repositories';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { SubscriptionEntity } from '@/core/aggregate-roots';
import { SubscriptionHistoryEntity } from '@/core/aggregate-roots';
import { SubscriptionItemVO, QuotaVO, SubscriptionChangeDetailsVO } from '@/core/value-objects';
import { ESubscriptionStatus, EPackageType } from '@/core/enums';
import { PackageEntity } from '@/core/aggregate-roots';

@CommandHandler(SubscriptionUpdateCommand)
export class SubscriptionUpdateHandler implements ICommandHandler<SubscriptionUpdateCommand, void> {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject(SUBSCRIPTION_HISTORY_REPOSITORY)
    private readonly historyRepository: ISubscriptionHistoryRepository,
    @Inject(BILL_REPOSITORY)
    private readonly billRepository: IBillRepository,
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: SubscriptionUpdateCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Fetch or initialize Subscription
      let subscription = await this.subscriptionRepository.findByEnterpriseId(input.enterpriseId);
      const isNew = !subscription;

      const startDate = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Default to 30 days subscription duration

      if (isNew) {
        subscription = SubscriptionEntity.create({
          enterpriseId: input.enterpriseId,
          status: ESubscriptionStatus.ACTIVE,
          items: [],
          computedQuotas: new QuotaVO({}),
          computedPermissions: [],
          nextExpiryCheckAt: expiresAt,
          version: 1,
        });
      }

      const originalVersion = subscription!.version;
      const oldPackages = subscription!.items.map((item) => item.packageId);
      const oldQuotas = subscription!.computedQuotas;
      const oldPermissions = subscription!.computedPermissions;

      // 2. Fetch bill
      const bill = await this.billRepository.findById(input.billId);
      if (!bill) {
        throw new Error(`Bill not found: ${input.billId}`);
      }

      // 3. Load all package entities involved in the bill
      const packageIds = bill.items.map((item) => item.packageId);
      const packages = (await Promise.all(
        packageIds.map((id) => this.packageRepository.findById(id))
      )).filter((p): p is PackageEntity => p !== null);

      const packageMap = new Map(packages.map((p) => [p.id, p]));

      // 4. Resolve replacement and add packages
      for (const billItem of bill.items) {
        const pkg = packageMap.get(billItem.packageId);
        if (!pkg) {
          throw new Error(`Package ${billItem.packageId} not found.`);
        }

        // If replacing a PLAN, remove any existing PLAN
        if (pkg.type === EPackageType.PLAN) {
          // Identify any active plan currently on the subscription
          const activeItems = subscription!.items;
          const activePackages = (await Promise.all(
            activeItems.map((item) => this.packageRepository.findById(item.packageId))
          )).filter((p): p is PackageEntity => p !== null);

          const activePlan = activePackages.find((p) => p.type === EPackageType.PLAN);
          if (activePlan && activePlan.id !== pkg.id) {
            subscription!.removePackage(activePlan.id!);
          }
        }

        const subscriptionItem = new SubscriptionItemVO({
          packageId: billItem.packageId,
          packageVariantId: billItem.packageVariantId,
          startDate,
          expiresAt,
          billId: input.billId,
        });

        subscription!.addPackage(subscriptionItem);
      }

      // 5. Aggregate quotas and permissions from all active subscription packages
      const currentPackageIds = subscription!.items.map((item) => item.packageId);
      const currentPackages = (await Promise.all(
        currentPackageIds.map((id) => this.packageRepository.findById(id))
      )).filter((p): p is PackageEntity => p !== null);

      const aggregatedQuotas: Record<string, number> = {};
      const permissionsSet = new Set<string>();

      for (const p of currentPackages) {
        // Base quotas
        const baseQuotas = p.baseQuotas.unmarshal;
        for (const [key, value] of Object.entries(baseQuotas)) {
          if (typeof value === 'number' && value !== null) {
            aggregatedQuotas[key] = (aggregatedQuotas[key] || 0) + value;
          }
        }

        // Variant extra quotas
        const activeItem = subscription!.items.find((item) => item.packageId === p.id);
        if (activeItem) {
          const variant = p.variants.find((v) => v.id === activeItem.packageVariantId);
          if (variant && variant.extraQuotas) {
            const extra = variant.extraQuotas.unmarshal;
            for (const [key, value] of Object.entries(extra)) {
              if (typeof value === 'number' && value !== null) {
                aggregatedQuotas[key] = (aggregatedQuotas[key] || 0) + value;
              }
            }
          }
        }

        // Permissions
        for (const feature of p.features) {
          for (const perm of feature.permissions) {
            permissionsSet.add(perm);
          }
        }
      }

      subscription!.updateComputedFields(new QuotaVO(aggregatedQuotas), Array.from(permissionsSet));

      // 6. Save subscription (new creation or update version locking)
      if (isNew) {
        await this.subscriptionRepository.save(subscription!);
      } else {
        await this.subscriptionRepository.updateWithVersion(
          subscription!.id!,
          originalVersion,
          subscription!
        );
      }

      // 7. Create history log
      const history = SubscriptionHistoryEntity.create({
        subscriptionId: subscription!.id!,
        enterpriseId: subscription!.enterpriseId,
        billId: input.billId,
        actorId: undefined,
        details: new SubscriptionChangeDetailsVO({
          oldPackages,
          newPackages: subscription!.items.map((item) => item.packageId),
          oldQuotas,
          newQuotas: subscription!.computedQuotas,
          oldPermissions,
          newPermissions: subscription!.computedPermissions,
        }),
        createdAt: new Date(),
      });

      await this.historyRepository.save(history);

      // 8. Record updated events to propagate domain integrations
      subscription!.recordSubscriptionUpdated(history.id!, history.details);

      // Save events to outbox (via repo context automatically)
      // Note: The unit-of-work wraps repository mutations and registers events.
    });
  }
}
