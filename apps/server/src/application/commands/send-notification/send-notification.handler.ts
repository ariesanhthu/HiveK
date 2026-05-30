import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserType } from '@/core/enums';
import { UserModel, UserDocument } from '@/infrastructure/mongo/schemas/user.schema';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationDispatchedEvent } from '@/application/events';

@CommandHandler(SendNotificationCommand)
export class SendNotificationCommandHandler implements ICommandHandler<SendNotificationCommand, void> {
  constructor(
    private readonly eventBus: EventBus,
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  async execute(command: SendNotificationCommand): Promise<void> {
    const { props } = command;
    const recipientIds: string[] = [];

    switch (props.audience.broadcastType) {
      case 'direct': {
        if (!props.audience.userIds || props.audience.userIds.length === 0) {
          throw new BadRequestException('Recipient user IDs are required for direct broadcast');
        }
        recipientIds.push(...props.audience.userIds);
        break;
      }
      case 'admin': {
        const admins = await this.userModel
          .find({ type: UserType.ADMIN, delete_at: null })
          .select('_id')
          .lean()
          .exec();
        recipientIds.push(...admins.map((admin) => admin._id.toString()));
        break;
      }
      case 'enterprise': {
        const { enterpriseId } = props.audience;
        if (!enterpriseId) {
          throw new BadRequestException('Enterprise ID is required for enterprise broadcast');
        }

        const enterprise = await this.enterpriseRepository.findById(enterpriseId);
        if (!enterprise) {
          throw new NotFoundException(`Enterprise with ID ${enterpriseId} not found`);
        }

        // Fetch enterprise members
        const members = await this.userModel
          .find({ type: UserType.ENTERPRISE, enterprise_id: enterpriseId, delete_at: null })
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
        throw new BadRequestException(`Unknown broadcast type: ${(props.audience as any).broadcastType}`);
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
