import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PackageModel } from '../schemas/package.schema';
import { SubscriptionModel } from '../schemas/subscription.schema';
import { CreditWalletModel } from '../schemas/credit-wallet.schema';
import { QuotaUsageModel } from '../schemas/quota-usage.schema';
import { EGrantType, EPackageType } from '@/core/enums';
import { env } from '@/shared/utils';

// ── Migration-specific legacy interfaces ──────────────────────────────
interface OldQuota {
  code: string;
  limit: number;
}

interface OldFeature {
  code: string;
}

interface OldSubscriptionItem {
  package_id: string;
  package_variant_id: string;
  start_date: Date;
  expires_at?: Date;
  bill_id: string;
  auto_renew?: boolean;
}

@Injectable()
export class PackageMigrationService implements OnModuleInit {
  private readonly logger = new Logger(PackageMigrationService.name);

  constructor(
    @InjectModel(PackageModel.name)
    private readonly packageModel: Model<PackageModel>,
    @InjectModel(SubscriptionModel.name)
    private readonly subscriptionModel: Model<SubscriptionModel>,
    @InjectModel(CreditWalletModel.name)
    private readonly creditWalletModel: Model<CreditWalletModel>,
    @InjectModel(QuotaUsageModel.name)
    private readonly quotaUsageModel: Model<QuotaUsageModel>,
  ) {}

  async onModuleInit() {
    if (env('SEEDING', '1') === '0') {
      return;
    }
    this.logger.log('Starting Package Refactor Database Migration check...');
    try {
      await this.migratePackages();
      await this.migrateSubscriptions();
    } catch (err) {
      this.logger.error('Failed to run Package Refactor Database Migration:', err);
    }
  }

  private async migratePackages() {
    const packages = await this.packageModel.find().exec();
    let migratedCount = 0;

    for (const pkg of packages) {
      const rawPkg = pkg as PackageModel & {
        base_quotas?: OldQuota[];
        features: OldFeature[] | string[];
      };
      let modified = false;

      // 1. Migrate base_quotas to base_grants
      if (rawPkg.base_quotas && rawPkg.base_quotas.length > 0 && (!rawPkg.base_grants || rawPkg.base_grants.length === 0)) {
        rawPkg.base_grants = rawPkg.base_quotas.map((q: OldQuota) => ({
          type: EGrantType.QUOTA_RENEWABLE,
          key: q.code,
          value: q.limit,
          reset_cycle: 'monthly' as const,
          credit_fallback: null,
        }));
        (rawPkg as unknown as Record<string, unknown>).base_quotas = undefined;
        modified = true;
      }

      // 2. Migrate variants' extra_quotas to extra_grants
      if (rawPkg.variants && rawPkg.variants.length > 0) {
        for (const variant of rawPkg.variants) {
          const v = variant as typeof variant & {
            extra_quotas?: OldQuota[];
          };
          if (v.extra_quotas && v.extra_quotas.length > 0 && (!v.extra_grants || v.extra_grants.length === 0)) {
            v.extra_grants = v.extra_quotas.map((q: OldQuota) => ({
              type: EGrantType.QUOTA_RENEWABLE,
              key: q.code,
              value: q.limit,
              reset_cycle: 'monthly' as const,
              credit_fallback: null,
            }));
            (v as unknown as Record<string, unknown>).extra_quotas = undefined;
            modified = true;
          }
        }
      }

      // 3. Migrate features from PackageFeatureSchema to string list
      if (rawPkg.features && rawPkg.features.length > 0 && typeof rawPkg.features[0] === 'object') {
        rawPkg.features = (rawPkg.features as unknown as OldFeature[]).map((f: OldFeature) => f.code);
        modified = true;
      }

      if (modified) {
        pkg.markModified('base_grants');
        pkg.markModified('variants');
        pkg.markModified('features');
        await pkg.save();
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      this.logger.log(`Successfully migrated ${migratedCount} packages to the new schema format.`);
    } else {
      this.logger.log('All packages are already up to date.');
    }
  }

  private async migrateSubscriptions() {
    const subscriptions = await this.subscriptionModel.find().exec();
    let migratedCount = 0;

    for (const sub of subscriptions) {
      const rawSub = sub as SubscriptionModel & {
        items?: OldSubscriptionItem[];
        plan_item?: {
          package_id: string;
          package_variant_id: string;
          start_date: Date;
          expires_at: Date;
          bill_id: string;
          auto_renew: boolean;
        } | null;
        computed_quotas?: Record<string, number>;
        computed_grants?: unknown[];
      };
      let modified = false;

      // 1. Migrate items array to plan_item + addon_items
      if (rawSub.items && rawSub.items.length > 0 && !rawSub.plan_item) {
        const itemsList = rawSub.items;
        const plansList: OldSubscriptionItem[] = [];
        const addonsList: OldSubscriptionItem[] = [];

        for (const item of itemsList) {
          const pkg = await this.packageModel.findById(item.package_id).exec();
          if (pkg && pkg.type === EPackageType.PLAN) {
            plansList.push(item);
          } else {
            addonsList.push(item);
          }
        }

        if (plansList.length > 0) {
          const plan = plansList[0];
          rawSub.plan_item = {
            package_id: plan.package_id,
            package_variant_id: plan.package_variant_id,
            start_date: plan.start_date,
            expires_at: plan.expires_at ?? new Date(),
            bill_id: plan.bill_id,
            auto_renew: plan.auto_renew ?? true,
            price: 0,
            price_after_discount: 0,
          };
        }

        rawSub.addon_items = addonsList.map((addon) => ({
          package_id: addon.package_id,
          package_variant_id: addon.package_variant_id,
          purchased_at: addon.start_date,
          expires_at: addon.expires_at ?? null,
          bill_id: addon.bill_id,
          price: 0,
          price_after_discount: 0,
        }));

        (rawSub as unknown as Record<string, unknown>).items = undefined;
        modified = true;
      }

      // 2. Migrate computed_quotas to computed_grants
      if (rawSub.computed_quotas && Object.keys(rawSub.computed_quotas).length > 0 && (!rawSub.computed_grants || rawSub.computed_grants.length === 0)) {
        rawSub.computed_grants = Object.entries(rawSub.computed_quotas).map(([key, limit]) => ({
          type: EGrantType.QUOTA_RENEWABLE,
          key,
          value: Number(limit),
          reset_cycle: 'monthly' as const,
          credit_fallback: null,
        }));
        (rawSub as unknown as Record<string, unknown>).computed_quotas = undefined;
        modified = true;
      }

      if (modified) {
        sub.markModified('plan_item');
        sub.markModified('addon_items');
        sub.markModified('computed_grants');
        await sub.save();
        migratedCount++;
      }

      // 3. Make sure CreditWallet and QuotaUsage exist
      const walletExists = await this.creditWalletModel.exists({ enterprise_id: sub.enterprise_id });
      if (!walletExists) {
        const wallet = new this.creditWalletModel({
          enterprise_id: sub.enterprise_id,
          balances: [],
        });
        await wallet.save();
        this.logger.log(`Created credit wallet for enterprise: ${sub.enterprise_id}`);
      }

      const quotaUsageExists = await this.quotaUsageModel.exists({ enterprise_id: sub.enterprise_id });
      if (!quotaUsageExists) {
        const anchorDate = rawSub.plan_item ? rawSub.plan_item.start_date : sub.get('created_at') || new Date();
        const usage = new this.quotaUsageModel({
          enterprise_id: sub.enterprise_id,
          cycle_anchor_date: anchorDate,
          usages: [],
        });
        await usage.save();
        this.logger.log(`Created quota usage record for enterprise: ${sub.enterprise_id}`);
      }
    }

    if (migratedCount > 0) {
      this.logger.log(`Successfully migrated ${migratedCount} subscriptions to the new format.`);
    } else {
      this.logger.log('All subscriptions are already up to date.');
    }
  }
}
