import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SOCIAL_PAGE_REPOSITORY, type ISocialPageRepository } from '@/core/interfaces/repositories';
import { EVENT_SERVICE, type IEventService, UNIT_OF_WORK, type IUnitOfWork } from '@/application/interfaces';
import { SocialPageDisconnectCommand } from './social-page-disconnect.command';
import { InvalidOperationException } from '@/core/exceptions';

@CommandHandler(SocialPageDisconnectCommand)
export class SocialPageDisconnectHandler implements ICommandHandler<SocialPageDisconnectCommand, { success: boolean }> {
  constructor(
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: SocialPageDisconnectCommand): Promise<{ success: boolean }> {
    await this.uow.startTransaction();
    try {
      const socialPage = await this.socialPageRepository.findById(command.socialPageId);
      if (!socialPage) {
        throw new Error('Social page connection not found.');
      }
      if (socialPage.enterpriseId !== command.enterpriseId) {
        throw new InvalidOperationException('Unauthorized enterprise operation on page connection.');
      }

      socialPage.softDelete(command.userId);

      await this.socialPageRepository.save(socialPage);
      await this.eventService.publishEvents(socialPage);
      await this.uow.commitTransaction();

      return { success: true };
    } catch (error) {
      await this.uow.rollbackTransaction();
      throw error;
    }
  }
}
