import { NotificationDispatchedEvent } from '@/application/events';
import { ERoleType } from '@/core/enums';
import { EnterpriseNotFoundException, InvalidOperationException } from '@/core/exceptions';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { UserDocument, UserModel } from '@/infrastructure/mongo/schemas/user.schema';
import { isEmpty } from '@/shared/utils';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationSendCommand } from './notification-send.command';

@CommandHandler(NotificationSendCommand)
export class NotificationSendCommandHandler
  implements ICommandHandler<NotificationSendCommand, void>
{
  constructor(
    private readonly eventBus: EventBus,
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
    @Inject(ENTERPRISE_REPOSITORY) private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  async execute(command: NotificationSendCommand): Promise<void> {
    const { props } = command;
    const recipientIds: string[] = [];

    switch (props.audience.broadcastType) {
      case 'direct': {
        if (isEmpty(props.audience.userIds)) {
          throw new InvalidOperationException(
            'Recipient user IDs are required for direct broadcast',
          );
        }
        recipientIds.push(...props.audience.userIds);
        break;
      }
      case 'admin': {
        const admins = await this.userModel
          .find({ type: ERoleType.ADMIN, delete_at: null })
          .select('_id')
          .lean()
          .exec();
        recipientIds.push(...admins.map((admin) => admin._id.toString()));
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
        const members = await this.userModel
          .find({ type: ERoleType.ENTERPRISE, enterprise_id: enterpriseId, delete_at: null })
          .select('_id')
          .lean()
          .exec();

        const memberIds = members.map((m) => m._id.toString());
        const uniqueIds = new Set<string>(memberIds);

        // Include enterprise owner
        if (enterprise.userId) {
          uniqueIds.add(enterprise.userId);
        }

        recipientIds.push(...Array.from(uniqueIds));
        break;
      }
      case 'all': {
        const allUsers = await this.userModel
          .find({ delete_at: null })
          .select('_id')
          .lean()
          .exec();
        recipientIds.push(...allUsers.map((u) => u._id.toString()));
        break;
      }
      default:
        throw new InvalidOperationException(
          `Unknown broadcast type: ${(props.audience as any).broadcastType}`,
        );
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
      ),
    );
  }
}
