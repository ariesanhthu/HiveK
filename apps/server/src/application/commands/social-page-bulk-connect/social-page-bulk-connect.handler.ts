import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { SOCIAL_PAGE_REPOSITORY, type ISocialPageRepository } from '@/core/interfaces/repositories';
import { PLATFORM_REPOSITORY, type IPlatformRepository } from '@/core/interfaces/repositories';
import { EVENT_SERVICE, type IEventService, UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { SocialPageRoot } from '@/core/aggregate-roots';
import { SocialPageBulkConnectCommand } from './social-page-bulk-connect.command';
import { SocialPageDto } from '@/application/dtos';
import { SocialPageMapper } from '@/application/mappers';
import { type ISocialPageConnectorFactory, SOCIAL_PAGE_CONNECTOR_FACTORY } from '@/core/interfaces';

@CommandHandler(SocialPageBulkConnectCommand)
export class SocialPageBulkConnectHandler implements ICommandHandler<SocialPageBulkConnectCommand, SocialPageDto[]> {
  private readonly logger = new Logger(SocialPageBulkConnectHandler.name);

  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: IPlatformRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(SOCIAL_PAGE_CONNECTOR_FACTORY)
    private readonly connectorFactory: ISocialPageConnectorFactory,
  ) {}

  async execute(command: SocialPageBulkConnectCommand): Promise<SocialPageDto[]> {
    const { enterpriseId, input } = command;

    // 1. Resolve platform by code
    const platform = await this.platformRepository.findByName(input.platformCode);
    if (!platform) {
      throw new Error(`Platform not found for code: ${input.platformCode}`);
    }

    // 2. Resolve platform connector and fetch pages
    const connector = this.connectorFactory.findByCode(input.platformCode);
    const accounts = await connector.getUserAccounts(input.longLivedUserToken);
    if (accounts.length === 0) {
      this.logger.warn(`No pages found for platform ${input.platformCode}`);
      return [];
    }

    // 3. Upsert all pages in a single transaction
    return this.uow.execute(async () => {
      const socialPages: SocialPageRoot[] = [];

      for (const account of accounts) {
        let socialPage = await this.socialPageRepository.findByPageId(
          input.platformCode,
          account.id,
        );

        if (socialPage) {
          // Page already connected — update token and sync page name
          socialPage.updateToken(account.accessToken, null);
          socialPage.updatePageInfo(account.name, null, null);
          socialPage.activate();
        } else {
          // New connection — pictureUrl and followerCount are null
          // because they require the pages_read_engagement permission
          socialPage = SocialPageRoot.create({
            enterpriseId,
            platformId: platform.id!,
            platformCode: input.platformCode,
            pageId: account.id,
            pageName: account.name,
            pictureUrl: null,
            followerCount: null,
            encryptedToken: account.accessToken,
            tokenExpiresAt: null,
          });
        }

        await this.socialPageRepository.save(socialPage);
        await this.eventService.publishEvents(socialPage);
        socialPages.push(socialPage);
      }

      return SocialPageMapper.toListDto(socialPages);
    });
  }
}
