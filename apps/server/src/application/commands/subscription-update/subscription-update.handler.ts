import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionUpdateCommand } from './subscription-update.command';
import {
  SUBSCRIPTION_REPOSITORY,
  type ISubscriptionRepository,
  SUBSCRIPTION_HISTORY_REPOSITORY,
  type ISubscriptionHistoryRepository,
  BILL_REPOSITORY,
  type IBillRepository,
  PACKAGE_REPOSITORY,
  type IPackageRepository,
  CREDIT_WALLET_REPOSITORY,
  type ICreditWalletRepository,
} from '@/core/interfaces/repositories';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import {
  SubscriptionRoot,
  SubscriptionHistoryEntity,
  PackageRoot,
  CreditWalletRoot
} from '@/core/aggregate-roots';
import {
  PlanItemVO,
  AddonItemVO,
  GrantVO,
  SubscriptionChangeDetailsVO
} from '@/core/value-objects';
import { ESubscriptionStatus, EPackageType, EBillLineType, EGrantType } from '@/core/enums';

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
    @Inject(CREDIT_WALLET_REPOSITORY)
    private readonly creditWalletRepository: ICreditWalletRepository,
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
      expiresAt.setDate(expiresAt.getDate() + 30); // Default to 30 days plan duration

      if (isNew) {
        subscription = SubscriptionRoot.create({
          enterpriseId: input.enterpriseId,
          status: ESubscriptionStatus.ACTIVE,
          planItem: null,
          addonItems: [],
          computedGrants: [],
          computedPermissions: [],
          nextExpiryCheckAt: expiresAt,
          version: 1,
        });
      }

      const originalVersion = subscription!.version;
      const oldPlanId = subscription!.planItem ? subscription!.planItem.packageId : null;
      const oldGrants = subscription!.computedGrants;
      const oldPermissions = subscription!.computedPermissions;

      // 2. Fetch bill
      const bill = await this.billRepository.findById(input.billId);
      if (!bill) {
        throw new Error(`Bill not found: ${input.billId}`);
      }

      // 3. Load or create Credit Wallet
      let wallet = await this.creditWalletRepository.findByEnterpriseId(input.enterpriseId);
      if (!wallet) {
        wallet = CreditWalletRoot.create(input.enterpriseId);
      }

      // 4. Load all package entities involved in the bill
      const packageIds = bill.items
        .map((item) => item.packageId)
        .filter((id): id is string => id !== null);

      const packages = (await Promise.all(
        packageIds.map((id) => this.packageRepository.findById(id))
      )).filter((p): p is PackageRoot => p !== null);

      const packageMap = new Map(packages.map((p) => [p.id, p]));
      const addedAddonIds: string[] = [];
      const removedAddonIds: string[] = [];

      // 5. Process bill items
      for (const billItem of bill.items) {
        if (billItem.lineType === EBillLineType.CREDIT_TOP_UP) {
          // Non-catalogue direct top-up
          if (billItem.creditType && billItem.creditAmount) {
            wallet.topUp(billItem.creditType, billItem.creditAmount, `Direct top-up: bill_${input.billId}`);
          }
          continue;
        }

        const pkg = packageMap.get(billItem.packageId!);
        if (!pkg) {
          throw new Error(`Package ${billItem.packageId} not found.`);
        }

        const variant = pkg.variants.find((v) => v.id === billItem.packageVariantId);
        if (!variant) {
          throw new Error(`Package variant ${billItem.packageVariantId} not found.`);
        }

        // Calculate effective grants (base + extra)
        const effectiveGrants = [...pkg.baseGrants, ...variant.extraGrants];

        if (billItem.lineType === EBillLineType.PLAN_PURCHASE) {
          // Process Plan Purchase
          const itemExpiresAt = new Date(startDate);
          if (variant.durationMonths) {
            itemExpiresAt.setMonth(itemExpiresAt.getMonth() + variant.durationMonths);
          } else {
            itemExpiresAt.setDate(itemExpiresAt.getDate() + 30);
          }

          const planItem = new PlanItemVO({
            packageId: billItem.packageId!,
            packageVariantId: billItem.packageVariantId!,
            startDate,
            expiresAt: itemExpiresAt,
            billId: input.billId,
            autoRenew: true,
          });

          subscription!.attachPlan(planItem);

          // Top up credits from plan grants
          for (const grant of effectiveGrants) {
            if (grant.type === EGrantType.CREDIT_TOP_UP) {
              wallet.topUp(grant.key, grant.value, `Plan activation: package_${pkg.code}`);
            }
          }
        } else if (billItem.lineType === EBillLineType.ADDON_PURCHASE) {
          // Process Addon Purchase
          const itemExpiresAt = variant.durationMonths
            ? new Date(startDate.getTime() + variant.durationMonths * 30 * 24 * 60 * 60 * 1000)
            : null;

          const addonItem = new AddonItemVO({
            packageId: billItem.packageId!,
            packageVariantId: billItem.packageVariantId!,
            purchasedAt: startDate,
            expiresAt: itemExpiresAt,
            billId: input.billId,
          });

          const success = subscription!.attachAddon(addonItem);
          if (success) {
            addedAddonIds.push(billItem.packageId!);
          }

          // Top up credits from addon grants
          for (const grant of effectiveGrants) {
            if (grant.type === EGrantType.CREDIT_TOP_UP) {
              wallet.topUp(grant.key, grant.value, `Addon purchase: package_${pkg.code}`);
            }
          }
        }
      }

      // 6. Gather all grants details for recomputing grants
      const activePackageIds: string[] = [];
      if (subscription!.planItem) {
        activePackageIds.push(subscription!.planItem.packageId);
      }
      for (const addon of subscription!.addonItems) {
        activePackageIds.push(addon.packageId);
      }

      const activePackages = (await Promise.all(
        activePackageIds.map((id) => this.packageRepository.findById(id))
      )).filter((p): p is PackageRoot => p !== null);

      const activePackageMap = new Map(activePackages.map((p) => [p.id, p]));

      // Build plan effective grants
      let planGrants: GrantVO[] = [];
      if (subscription!.planItem) {
        const planPkg = activePackageMap.get(subscription!.planItem.packageId);
        if (planPkg) {
          const planVariant = planPkg.variants.find((v) => v.id === subscription!.planItem!.packageVariantId);
          if (planVariant) {
            planGrants = [...planPkg.baseGrants, ...planVariant.extraGrants];
          }
        }
      }

      // Build addon effective grants map
      const addonsGrantsMap = new Map<string, GrantVO[]>();
      for (const addon of subscription!.addonItems) {
        const addonPkg = activePackageMap.get(addon.packageId);
        if (addonPkg) {
          const addonVariant = addonPkg.variants.find((v) => v.id === addon.packageVariantId);
          if (addonVariant) {
            const grants = [...addonPkg.baseGrants, ...addonVariant.extraGrants];
            addonsGrantsMap.set(addon.packageVariantId, grants);
          }
        }
      }

      // Recompute computed fields
      subscription!.recomputeGrants(planGrants, addonsGrantsMap);

      // 7. Calculate next expiry check date
      let minExpiry = expiresAt;
      if (subscription!.planItem) {
        minExpiry = subscription!.planItem.expiresAt;
      }
      for (const addon of subscription!.addonItems) {
        if (addon.expiresAt && addon.expiresAt < minExpiry) {
          minExpiry = addon.expiresAt;
        }
      }
      subscription!.updateComputedFields(subscription!.computedGrants, subscription!.computedPermissions);

      // 8. Save entities
      if (isNew) {
        await this.subscriptionRepository.save(subscription!);
      } else {
        await this.subscriptionRepository.updateWithVersion(
          subscription!.id!,
          originalVersion,
          subscription!
        );
      }

      await this.creditWalletRepository.save(wallet);

      // 9. Create history log
      const newPlanId = subscription!.planItem ? subscription!.planItem.packageId : null;
      const history = SubscriptionHistoryEntity.create({
        subscriptionId: subscription!.id!,
        enterpriseId: subscription!.enterpriseId,
        billId: input.billId,
        actorId: undefined,
        details: new SubscriptionChangeDetailsVO({
          oldPlanId,
          newPlanId,
          addedAddonIds,
          removedAddonIds,
          oldGrants,
          newGrants: subscription!.computedGrants,
          oldPermissions,
          newPermissions: subscription!.computedPermissions,
        }),
        createdAt: new Date(),
      });

      await this.historyRepository.save(history);

      // 10. Record updated events to propagate domain integrations
      subscription!.recordSubscriptionUpdated(history.id!, history.details);
    });
  }
}
