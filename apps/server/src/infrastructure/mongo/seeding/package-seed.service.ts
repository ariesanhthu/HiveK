import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PackageModel } from '../schemas/package.schema';
import { PACKAGE_REPOSITORY, type IPackageRepository } from '@/core/interfaces/repositories';
import { PackageRoot } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';
import { GrantVO } from '@/core/value-objects';
import { EVersionStatus, EPackageType, EPackageScope, ECurrency, EGrantType } from '@/core/enums';
import { env } from '@/shared/utils';

@Injectable()
export class PackageSeedService implements OnModuleInit {
  private readonly logger = new Logger(PackageSeedService.name);

  constructor(
    @InjectModel(PackageModel.name)
    private readonly packageModel: Model<PackageModel>,
    @Inject(PACKAGE_REPOSITORY)
    private readonly packageRepository: IPackageRepository,
  ) {}

  async onModuleInit() {
    if (env('SEEDING', '0') === '0') {
      return;
    }
    await this.seedPackage();
  }

  private async seedPackage() {
    const code = 'PRO_ENTERPRISE_SUITE';
    const count = await this.packageModel.countDocuments({ code });
    if (count > 0) {
      this.logger.log(`Package "${code}" already seeded. Skipping...`);
      return;
    }

    this.logger.log(`Seeding default package "${code}"...`);

    const packageRoot = PackageRoot.create({
      code,
      name: 'Enterprise Pro Suite',
      description:
        'Comprehensive subscription plan for scaling enterprise marketing & KOL campaign operations, featuring hard quotas, monthly renewable quotas, credit top-ups, and custom permissions.',
      type: EPackageType.PLAN,
      scope: EPackageScope.PUBLIC,
      enterpriseId: null,
      status: EVersionStatus.ACTIVE,
      activatedAt: new Date(),
      features: [
        'Unlimited Campaign Creation',
        'AI Content Generation & Optimization',
        'Advanced KOL Performance Analytics',
        'Multi-member Team Workspace & Role Management',
        'Automated Post Scheduling & Social Network Integration',
        'Dedicated 24/7 Enterprise Support',
      ],
      baseGrants: [
        // 1. Renewable quota: 50 active campaign slots per month
        new GrantVO({
          type: EGrantType.QUOTA_RENEWABLE,
          key: 'monthly_campaigns',
          value: 50,
          resetCycle: 'monthly',
        }),
        // 2. Renewable quota with credit fallback: 100,000 AI tokens per month (fallback: 1 AI token = 1 AI_CREDIT)
        new GrantVO({
          type: EGrantType.QUOTA_RENEWABLE,
          key: 'ai_tokens',
          value: 100000,
          resetCycle: 'monthly',
          creditFallback: {
            creditType: 'AI_CREDIT',
            creditsPerUnit: 1,
          },
        }),
        // 3. Hard quota: 500 GB cloud storage allocation
        new GrantVO({
          type: EGrantType.QUOTA_HARD,
          key: 'storage_gb',
          value: 500,
        }),
        // 4. Credit top up: 1,000 bonus credits upon subscription
        new GrantVO({
          type: EGrantType.CREDIT_TOP_UP,
          key: 'bonus_credits',
          value: 1000,
        }),
        // 5. Permission grant: Feature flag for exporting PDF reports
        new GrantVO({
          type: EGrantType.PERMISSION,
          key: 'export_pdf_reports',
          value: 1,
        }),
      ],
      variants: [
        // Variant 1: Monthly Plan
        PackageVariantEntity.create(
          {
            title: 'Monthly Billing',
            durationMonths: 1,
            price: 1200000,
            priceAfterDiscount: 990000,
            tax: 99000,
            currency: ECurrency.VND,
            extraGrants: [
              new GrantVO({
                type: EGrantType.CREDIT_TOP_UP,
                key: 'monthly_welcome_bonus',
                value: 200,
              }),
            ],
          },
          new Types.ObjectId().toString(),
        ),
        // Variant 2: Yearly Plan (Best Value - 20% Discount)
        PackageVariantEntity.create(
          {
            title: 'Yearly Billing (Save 20%)',
            durationMonths: 12,
            price: 14400000,
            priceAfterDiscount: 9900000,
            tax: 990000,
            currency: ECurrency.VND,
            extraGrants: [
              new GrantVO({
                type: EGrantType.CREDIT_TOP_UP,
                key: 'yearly_welcome_bonus',
                value: 3000,
              }),
              new GrantVO({
                type: EGrantType.PERMISSION,
                key: 'priority_support_badge',
                value: 1,
              }),
            ],
          },
          new Types.ObjectId().toString(),
        ),
      ],
    });

    try {
      await this.packageRepository.save(packageRoot);
      this.logger.log(`Successfully seeded package "${code}".`);
    } catch (error) {
      this.logger.error(`Failed to seed package "${code}":`, error);
    }
  }
}
