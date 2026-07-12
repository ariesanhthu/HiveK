import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SOCIAL_PAGE_REPOSITORY, type ISocialPageRepository } from '@/core/interfaces/repositories';
import { UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { FacebookTokenService } from '@/infrastructure/facebook/facebook-token.service';
import { SocialPageRefreshTokenCommand } from './social-page-refresh-token.command';
import { SocialPageDto } from '@/application/dtos';
import { SocialPageMapper } from '@/application/mappers';

@CommandHandler(SocialPageRefreshTokenCommand)
export class SocialPageRefreshTokenHandler implements ICommandHandler<SocialPageRefreshTokenCommand, SocialPageDto> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    private readonly facebookTokenService: FacebookTokenService,
  ) {}

  async execute(command: SocialPageRefreshTokenCommand): Promise<SocialPageDto> {
    const { socialPageId, enterpriseId, userAccessToken } = command;

    const socialPage = await this.socialPageRepository.findById(socialPageId);
    if (!socialPage) {
      throw new NotFoundException('Social page connection not found.');
    }

    if (socialPage.enterpriseId !== enterpriseId) {
      throw new ForbiddenException('Unauthorized access to this social page connection.');
    }

    // 1. Exchange user access token for a long-lived one
    const longLivedUserToken = await this.facebookTokenService.exchangeUserTokenForLongLivedToken(userAccessToken);

    // 2. Fetch page accounts to find the fresh page token
    const accounts = await this.facebookTokenService.getUserAccounts(longLivedUserToken);
    const matchingAccount = accounts.find((acc) => acc.id === socialPage.pageId);

    if (!matchingAccount) {
      throw new NotFoundException('The page is no longer manageable with the provided Facebook account.');
    }

    // 3. Get details to get picture and follower count
    const details = await this.facebookTokenService.getPageDetails(matchingAccount.access_token, socialPage.pageId);

    await this.uow.startTransaction();
    try {
      socialPage.updateToken(matchingAccount.access_token);
      socialPage.updatePageInfo(details.name, details.picture?.data?.url, details.fan_count);
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
