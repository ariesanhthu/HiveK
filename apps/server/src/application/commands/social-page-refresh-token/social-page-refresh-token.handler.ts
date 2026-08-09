import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  SOCIAL_PAGE_REPOSITORY,
  type ISocialPageRepository,
} from '@/core/interfaces/repositories';
import { UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import {
  type ISocialPageConnectorFactory,
  SOCIAL_PAGE_CONNECTOR_FACTORY,
} from '@/core/interfaces';
import { SocialPageRefreshTokenCommand } from './social-page-refresh-token.command';
import { SocialPageDto } from '@/application/dtos';
import { SocialPageMapper } from '@/application/mappers';

@CommandHandler(SocialPageRefreshTokenCommand)
export class SocialPageRefreshTokenHandler implements ICommandHandler<
  SocialPageRefreshTokenCommand,
  SocialPageDto
> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(SOCIAL_PAGE_CONNECTOR_FACTORY)
    private readonly connectorFactory: ISocialPageConnectorFactory,
  ) {}

  async execute(
    command: SocialPageRefreshTokenCommand,
  ): Promise<SocialPageDto> {
    const { socialPageId, enterpriseId, userAccessToken } = command;

    const socialPage = await this.socialPageRepository.findById(socialPageId);
    if (!socialPage) {
      throw new NotFoundException('Social page connection not found.');
    }

    if (socialPage.enterpriseId !== enterpriseId) {
      throw new ForbiddenException(
        'Unauthorized access to this social page connection.',
      );
    }

    // 1. Resolve platform connector
    const connector = this.connectorFactory.findByCode(socialPage.platformCode);

    // 2. Exchange user access token for a long-lived one
    const longLivedUserToken =
      await connector.exchangeForLongLivedToken(userAccessToken);

    // 3. Fetch page accounts to find the fresh page token
    const accounts = await connector.getUserAccounts(longLivedUserToken);
    const matchingAccount = accounts.find(
      (acc) => acc.id === socialPage.pageId,
    );

    if (!matchingAccount) {
      throw new NotFoundException(
        'The page is no longer manageable with the provided Facebook account.',
      );
    }

    // 4. Get details to get picture and follower count
    const details = await connector.getPageDetails(
      matchingAccount.accessToken,
      socialPage.pageId,
    );

    await this.uow.startTransaction();
    try {
      socialPage.updateToken(matchingAccount.accessToken);
      socialPage.updatePageInfo(
        details.name,
        details.pictureUrl,
        details.followerCount,
      );
      socialPage.activate();

      await this.socialPageRepository.save(socialPage);
      await this.uow.commitTransaction();

      return SocialPageMapper.toDto(socialPage);
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }
  }
}
