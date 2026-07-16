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
      { name: EnterpriseInvitationModel.name, schema: EnterpriseInvitationSchema },
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
    // Export MongooseModule so domain modules can use the models if needed
    MongooseModule,
    RoleSeedService,
  ],
})
export class MongoModule {}