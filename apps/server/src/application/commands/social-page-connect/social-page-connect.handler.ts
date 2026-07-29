import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
} from '@/core/interfaces/repositories';
import {
  EVENT_SERVICE,
  type IEventService,
  UNIT_OF_WORK,
  type IUnitOfWork,
} from '@/application/interfaces';
import { SocialPageRoot } from '@/core/aggregate-roots';
import { SocialPageConnectCommand } from './social-page-connect.command';
import { SocialPageDto } from '@/application/dtos';
import { SocialPageMapper } from '@/application/mappers';
import {
  type ISocialPageConnectorFactory,
  SOCIAL_PAGE_CONNECTOR_FACTORY,
} from '@/core/interfaces';

@CommandHandler(SocialPageConnectCommand)
export class SocialPageConnectHandler implements ICommandHandler<
  SocialPageConnectCommand,
  SocialPageDto
> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(SOCIAL_PAGE_CONNECTOR_FACTORY)
    private readonly connectorFactory: ISocialPageConnectorFactory,
  ) {}

  async execute(command: SocialPageConnectCommand): Promise<SocialPageDto> {
    const { enterpriseId, input } = command;
    const expiresAt = input.tokenExpiresAt
      ? new Date(input.tokenExpiresAt)
      : null;

    let finalAccessToken = input.accessToken;
    let finalPageName = input.pageName;
    let finalPictureUrl = input.pictureUrl || null;
    let finalFollowerCount = input.followerCount || null;

    // Secure server-side validation of page token and metadata
    if (input.platformCode === 'facebook') {
      try {
        const connector = this.connectorFactory.findByCode(input.platformCode);
        const details = await connector.getPageDetails(
          input.accessToken,
          input.pageId,
        );
        if (details && details.accessToken) {
          finalAccessToken = details.accessToken;
          finalPageName = details.name;
          finalPictureUrl = details.pictureUrl || null;
          finalFollowerCount = details.followerCount || null;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        throw new Error(
          `Failed to verify page details via Facebook Graph API: ${message}`,
        );
      }
    }

    await this.uow.startTransaction();
    try {
      let socialPage = await this.socialPageRepository.findByPageId(
        input.platformCode,
        input.pageId,
      );

      if (socialPage) {
        // Page already connected, update token and sync details
        socialPage.updateToken(finalAccessToken, expiresAt);
        socialPage.updatePageInfo(
          finalPageName,
          finalPictureUrl,
          finalFollowerCount,
        );
        socialPage.activate();
      } else {
        // New connection
        socialPage = SocialPageRoot.create({
          enterpriseId,
          platformId: input.platformId,
          platformCode: input.platformCode,
          pageId: input.pageId,
          pageName: finalPageName,
          pictureUrl: finalPictureUrl,
          followerCount: finalFollowerCount,
          encryptedToken: finalAccessToken, // Store plain token (repo handles encryption)
          tokenExpiresAt: expiresAt,
        });
      }

      await this.socialPageRepository.save(socialPage);
      await this.eventService.publishEvents(socialPage);
      await this.uow.commitTransaction();

      return SocialPageMapper.toDto(socialPage);
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }
  }
}
