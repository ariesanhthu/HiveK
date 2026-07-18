import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { MongoUnitOfWork } from './mongo-uow';
import { CAMPAIGN_PROPOSAL_READ_SERVICE, PUBLIC_REVIEW_READ_SERVICE, UNIT_OF_WORK } from '@/application/interfaces';
import {
  UserModel, UserSchema,
  AdminModel, AdminSchema,
  EnterpriseUserModel, EnterpriseUserSchema,
  KOLUserModel, KOLUserSchema,
  RoleModel, RoleSchema,
  EnterpriseModel, EnterpriseSchema,
  PlatformModel, PlatformSchema,
  KolProfileModel, KolProfileSchema,
  CampaignModel, CampaignSchema,
  NotificationModel, NotificationSchema,
  UserNotificationModel, UserNotificationSchema,
  UploadedFileModel, UploadedFileSchema,
  OtpModel, OtpSchema,
  KpiLogModel, KpiLogSchema,
  OutboxModel, OutboxSchema,
  PublicReviewSchema,
  PublicReviewModel,
  CampaignProposalSchema,
  CampaignProposalModel,
  BillModel, BillSchema,
  PackageModel, PackageSchema,
  PaymentProviderModel, PaymentProviderSchema,
  PaymentModel, PaymentSchema,
  SubscriptionModel, SubscriptionSchema,
  SubscriptionHistoryModel, SubscriptionHistorySchema,
  SocialPageModel, SocialPageSchema,
  ScheduledPostModel, ScheduledPostSchema,
  AutoReplyRuleModel, AutoReplyRuleSchema,
  CreditWalletModel, CreditWalletSchema,
  QuotaUsageModel, QuotaUsageSchema,
  EnterpriseQuotaAllocationModel, EnterpriseQuotaAllocationSchema,
  EnterpriseInvitationModel,
  EnterpriseInvitationSchema,
} from './schemas';

// Repository imports
import {
  MongoUserRepository,
  MongoRoleRepository,
  MongoEnterpriseRepository,
  MongoPlatformRepository,
  MongoKolProfileRepository,
  MongoCampaignRepository,
  MongoNotificationRepository,
  MongoUserNotificationRepository,
  MongoUploadedFileRepository,
  MongoOtpRepository,
  MongoKpiLogRepository,
  MongoBillRepository,
  MongoPackageRepository,
  MongoPaymentProviderRepository,
  MongoPaymentRepository,
  MongoSubscriptionRepository,
  MongoSubscriptionHistoryRepository,
  MongoSocialPageRepository,
  MongoScheduledPostRepository,
  MongoAutoReplyRuleRepository,
  MongoCreditWalletRepository,
  MongoQuotaUsageRepository,
  MongoEnterpriseInvitationRepository,
} from './repositories';

// Read Service imports
import {
  MongoUserReadService,
  MongoRoleReadService,
  MongoEnterpriseReadService,
  MongoPlatformReadService,
  MongoKolProfileReadService,
  MongoCampaignReadService,
  MongoCampaignParticipantReadService,
  MongoNotificationReadService,
  MongoUploadedFileReadService,
  MongoKpiLogReadService,
  MongoPackageReadService,
  MongoBillReadService,
  MongoPaymentProviderReadService,
  MongoEnterpriseInvitationReadService,
} from './read-services';

// Repository symbols
import {
  USER_REPOSITORY,
  ROLE_REPOSITORY,
  ENTERPRISE_REPOSITORY,
  PLATFORM_REPOSITORY,
  KOL_PROFILE_REPOSITORY,
  CAMPAIGN_REPOSITORY,
  NOTIFICATION_REPOSITORY,
  USER_NOTIFICATION_REPOSITORY,
  UPLOADED_FILE_REPOSITORY,
  OTP_REPOSITORY,
  KPI_LOG_REPOSITORY,
  PUBLIC_REVIEW_REPOSITORY,
  CAMPAIGN_PROPOSAL_REPOSITORY,
  BILL_REPOSITORY,
  PACKAGE_REPOSITORY,
  PAYMENT_PROVIDER_REPOSITORY,
  PAYMENT_REPOSITORY,
  SUBSCRIPTION_REPOSITORY,
  SUBSCRIPTION_HISTORY_REPOSITORY,
  SOCIAL_PAGE_REPOSITORY,
  SCHEDULED_POST_REPOSITORY,
  AUTO_REPLY_RULE_REPOSITORY,
  CREDIT_WALLET_REPOSITORY,
  QUOTA_USAGE_REPOSITORY,
  ENTERPRISE_INVITATION_REPOSITORY,
} from '@/core/interfaces/repositories';

// Read Service symbols
import {
  USER_READ_SERVICE,
  ROLE_READ_SERVICE,
  ENTERPRISE_READ_SERVICE,
  PLATFORM_READ_SERVICE,
  KOL_PROFILE_READ_SERVICE,
  CAMPAIGN_READ_SERVICE,
  CAMPAIGN_PARTICIPANT_READ_SERVICE,
  NOTIFICATION_READ_SERVICE,
  UPLOADED_FILE_READ_SERVICE,
  KPI_LOG_READ_SERVICE,
  PACKAGE_READ_SERVICE,
  BILL_READ_SERVICE,
  PAYMENT_PROVIDER_READ_SERVICE,
  ENTERPRISE_INVITATION_READ_SERVICE,
} from '@/application/interfaces';

import { RoleSeedService } from './seeding/role-seed.service';
import { ERoleType } from '@/core/enums';
import { MongoPublicReviewReadService } from './read-services/public-review.read-service';
import { MongoPublicReviewRepository } from './repositories/public-review.repository';
import { MongoCampaignProposalRepository } from './repositories/campaign-proposal.repository';
import { MongoCampaignProposalReadService } from './read-services/campaign-proposal.read-service';

@Global()
@Module({
  imports: [
    // Root MongoDB connection
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    // Register ALL schemas here
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
        discriminators: [
          { name: ERoleType.ADMIN, schema: AdminSchema },
          { name: ERoleType.ENTERPRISE, schema: EnterpriseUserSchema },
          { name: ERoleType.KOL, schema: KOLUserSchema },
        ],
      },
      { name: RoleModel.name, schema: RoleSchema },
      { name: EnterpriseModel.name, schema: EnterpriseSchema },
      { name: PlatformModel.name, schema: PlatformSchema },
      { name: KolProfileModel.name, schema: KolProfileSchema },
      { name: CampaignModel.name, schema: CampaignSchema },
      { name: NotificationModel.name, schema: NotificationSchema },
      { name: UserNotificationModel.name, schema: UserNotificationSchema },
      { name: UploadedFileModel.name, schema: UploadedFileSchema },
      { name: OtpModel.name, schema: OtpSchema },
      { name: KpiLogModel.name, schema: KpiLogSchema },
      { name: OutboxModel.name, schema: OutboxSchema },
      { name: PublicReviewModel.name, schema: PublicReviewSchema },
      { name: CampaignProposalModel.name, schema: CampaignProposalSchema },
      { name: BillModel.name, schema: BillSchema },
      { name: PackageModel.name, schema: PackageSchema },
      { name: PaymentProviderModel.name, schema: PaymentProviderSchema },
      { name: PaymentModel.name, schema: PaymentSchema },
      { name: SubscriptionModel.name, schema: SubscriptionSchema },
      { name: SubscriptionHistoryModel.name, schema: SubscriptionHistorySchema },
      { name: SocialPageModel.name, schema: SocialPageSchema },
      { name: ScheduledPostModel.name, schema: ScheduledPostSchema },
      { name: AutoReplyRuleModel.name, schema: AutoReplyRuleSchema },
      { name: CreditWalletModel.name, schema: CreditWalletSchema },
      { name: QuotaUsageModel.name, schema: QuotaUsageSchema },
      { name: EnterpriseInvitationModel.name, schema: EnterpriseInvitationSchema },
      { name: EnterpriseQuotaAllocationModel.name, schema: EnterpriseQuotaAllocationSchema },
    ]),
  ],
  providers: [
    // Unit of Work
    {
      provide: UNIT_OF_WORK,
      useClass: MongoUnitOfWork,
    },
    // All Repositories
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: MongoRoleRepository,
    },
    {
      provide: ENTERPRISE_REPOSITORY,
      useClass: MongoEnterpriseRepository,
    },
    {
      provide: PLATFORM_REPOSITORY,
      useClass: MongoPlatformRepository,
    },
    {
      provide: KOL_PROFILE_REPOSITORY,
      useClass: MongoKolProfileRepository,
    },
    {
      provide: CAMPAIGN_REPOSITORY,
      useClass: MongoCampaignRepository,
    },
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: MongoNotificationRepository,
    },
    {
      provide: USER_NOTIFICATION_REPOSITORY,
      useClass: MongoUserNotificationRepository,
    },
    {
      provide: UPLOADED_FILE_REPOSITORY,
      useClass: MongoUploadedFileRepository,
    },
    {
      provide: OTP_REPOSITORY,
      useClass: MongoOtpRepository,
    },
    {
      provide: KPI_LOG_REPOSITORY,
      useClass: MongoKpiLogRepository
    },
    {
      provide: PUBLIC_REVIEW_REPOSITORY,
      useClass: MongoPublicReviewRepository,
    },
    {
      provide: CAMPAIGN_PROPOSAL_REPOSITORY,
      useClass: MongoCampaignProposalRepository,
    },
    {
      provide: BILL_REPOSITORY,
      useClass: MongoBillRepository,
    },
    {
      provide: PACKAGE_REPOSITORY,
      useClass: MongoPackageRepository,
    },
    {
      provide: PAYMENT_PROVIDER_REPOSITORY,
      useClass: MongoPaymentProviderRepository,
    },
    {
      provide: PAYMENT_REPOSITORY,
      useClass: MongoPaymentRepository,
    },
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: MongoSubscriptionRepository,
    },
    {
      provide: SUBSCRIPTION_HISTORY_REPOSITORY,
      useClass: MongoSubscriptionHistoryRepository,
    },
    {
      provide: SOCIAL_PAGE_REPOSITORY,
      useClass: MongoSocialPageRepository,
    },
    {
      provide: SCHEDULED_POST_REPOSITORY,
      useClass: MongoScheduledPostRepository,
    },
    {
      provide: AUTO_REPLY_RULE_REPOSITORY,
      useClass: MongoAutoReplyRuleRepository,
    },
    {
      provide: CREDIT_WALLET_REPOSITORY,
      useClass: MongoCreditWalletRepository,
    },
    {
      provide: QUOTA_USAGE_REPOSITORY,
      useClass: MongoQuotaUsageRepository,
    },
    {
      provide: ENTERPRISE_INVITATION_REPOSITORY,
      useClass: MongoEnterpriseInvitationRepository,
    },
    // All Read Services
    {
      provide: USER_READ_SERVICE,
      useClass: MongoUserReadService,
    },
    {
      provide: ROLE_READ_SERVICE,
      useClass: MongoRoleReadService,
    },
    {
      provide: ENTERPRISE_READ_SERVICE,
      useClass: MongoEnterpriseReadService,
    },
    {
      provide: PLATFORM_READ_SERVICE,
      useClass: MongoPlatformReadService,
    },
    {
      provide: KOL_PROFILE_READ_SERVICE,
      useClass: MongoKolProfileReadService,
    },
    {
      provide: CAMPAIGN_READ_SERVICE,
      useClass: MongoCampaignReadService,
    },
    {
      provide: CAMPAIGN_PARTICIPANT_READ_SERVICE,
      useClass: MongoCampaignParticipantReadService,
    },
    {
      provide: NOTIFICATION_READ_SERVICE,
      useClass: MongoNotificationReadService,
    },
    {
      provide: UPLOADED_FILE_READ_SERVICE,
      useClass: MongoUploadedFileReadService,
    },
    {
      provide: KPI_LOG_READ_SERVICE,
      useClass: MongoKpiLogReadService,
    },
    {
      provide: PUBLIC_REVIEW_READ_SERVICE,
      useClass: MongoPublicReviewReadService,
    },
    {
      provide: CAMPAIGN_PROPOSAL_READ_SERVICE,
      useClass: MongoCampaignProposalReadService,
    },
    {
      provide: PACKAGE_READ_SERVICE,
      useClass: MongoPackageReadService,
    },
    {
      provide: BILL_READ_SERVICE,
      useClass: MongoBillReadService,
    },
    {
      provide: PAYMENT_PROVIDER_READ_SERVICE,
      useClass: MongoPaymentProviderReadService,
    },
    {
      provide: ENTERPRISE_INVITATION_READ_SERVICE,
      useClass: MongoEnterpriseInvitationReadService,
    },
    // Seed service
    RoleSeedService,
  ],
  exports: [
    UNIT_OF_WORK,
    // Export all repository tokens
    USER_REPOSITORY,
    ROLE_REPOSITORY,
    ENTERPRISE_REPOSITORY,
    PLATFORM_REPOSITORY,
    KOL_PROFILE_REPOSITORY,
    CAMPAIGN_REPOSITORY,
    NOTIFICATION_REPOSITORY,
    USER_NOTIFICATION_REPOSITORY,
    UPLOADED_FILE_REPOSITORY,
    OTP_REPOSITORY,
    KPI_LOG_REPOSITORY,
    CAMPAIGN_PROPOSAL_REPOSITORY,
    PUBLIC_REVIEW_REPOSITORY,
    BILL_REPOSITORY,
    PACKAGE_REPOSITORY,
    PAYMENT_PROVIDER_REPOSITORY,
    PAYMENT_REPOSITORY,
    SUBSCRIPTION_REPOSITORY,
    SUBSCRIPTION_HISTORY_REPOSITORY,
    SOCIAL_PAGE_REPOSITORY,
    SCHEDULED_POST_REPOSITORY,
    AUTO_REPLY_RULE_REPOSITORY,
    CREDIT_WALLET_REPOSITORY,
    QUOTA_USAGE_REPOSITORY,
    ENTERPRISE_INVITATION_REPOSITORY,
    // Export all read service tokens
    USER_READ_SERVICE,
    ROLE_READ_SERVICE,
    ENTERPRISE_READ_SERVICE,
    PLATFORM_READ_SERVICE,
    KOL_PROFILE_READ_SERVICE,
    CAMPAIGN_READ_SERVICE,
    CAMPAIGN_PARTICIPANT_READ_SERVICE,
    NOTIFICATION_READ_SERVICE,
    UPLOADED_FILE_READ_SERVICE,
    KPI_LOG_READ_SERVICE,
    CAMPAIGN_PROPOSAL_READ_SERVICE,
    PUBLIC_REVIEW_READ_SERVICE,
    PACKAGE_READ_SERVICE,
    BILL_READ_SERVICE,
    PAYMENT_PROVIDER_READ_SERVICE,
    ENTERPRISE_INVITATION_READ_SERVICE,
    // Export MongooseModule so domain modules can use the models if needed
    MongooseModule,
    RoleSeedService,
  ],
})
export class MongoModule {}