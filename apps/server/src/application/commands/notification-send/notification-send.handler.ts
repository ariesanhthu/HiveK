import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ERoleType } from '@/core/enums';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { USER_READ_SERVICE, type IUserReadService } from '@/application/interfaces';
import { NotificationSendCommand } from './notification-send.command';
import { NotificationDispatchedEvent } from '@/application/events';
import { EnterpriseNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { isEmpty } from '@/shared/utils';

@CommandHandler(NotificationSendCommand)
export class NotificationSendCommandHandler implements ICommandHandler<NotificationSendCommand, void> {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(USER_READ_SERVICE)
    private readonly userReadService: IUserReadService,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  async execute(command: NotificationSendCommand): Promise<void> {
    const { props } = command;
    const recipientIds: string[] = [];

    switch (props.audience.broadcastType) {
      case 'direct': {
        if (isEmpty(props.audience.userIds)) {
          throw new InvalidOperationException('Recipient user IDs are required for direct broadcast');
        }
        recipientIds.push(...props.audience.userIds);
        break;
      }
      case 'admin': {
        recipientIds.push(...await this.userReadService.findByRoleType(ERoleType.ADMIN));
        break;
      }
      case 'enterprise': {
        const { enterpriseId } = props.audience;
        if (!enterpriseId) {
          throw new InvalidOperationException('Enterprise ID is required for enterprise broadcast');
        }

        const enterprise = await this.enterpriseRepository.findById(enterpriseId);
        if (!enterprise) {
          throw new EnterpriseNotFoundException(enterpriseId);
        }

        // Fetch enterprise members
        const memberIds = await this.userReadService.findByEnterprise(enterpriseId);
        const uniqueIds = new Set<string>(memberIds);

        // Include enterprise owner
        if (enterprise.userId) {
          uniqueIds.add(enterprise.userId);
        }

        recipientIds.push(...Array.from(uniqueIds));
        break;
      }
      case 'all': {
        recipientIds.push(...await this.userReadService.findAllActive());
        break;
      }
      default: {
        // Exhaustive check - TypeScript will error if we miss a case
        const _exhaustiveCheck: never = props.audience.broadcastType;
        throw new InvalidOperationException(`Unknown broadcast type: ${_exhaustiveCheck}`);
      }
    }

    if (recipientIds.length === 0) {
      return;
    }

    // Publish event for delivery subscribers to process
    this.eventBus.publish(
      new NotificationDispatchedEvent(
        {
          type: props.type,
          title: props.title,
          content: props.content,
          targetType: props.targetType,
          targetId: props.targetId,
        },
        recipientIds,
        props.channels,
      )
    );
  }
}
