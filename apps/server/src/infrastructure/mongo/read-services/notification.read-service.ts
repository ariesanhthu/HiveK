import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  QueryFilter,
  Types,
  PipelineStage,
  FlattenMaps,
} from 'mongoose';
import { INotificationReadService } from '@/application/interfaces';
import { UserNotificationModel, UserNotificationDocument } from '../schemas';
import { NotificationDto, NotificationFilterDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { Nullable } from '@/core/types';
import { ETargetType, NotificationType } from '@/core/enums';

interface RawNotificationDoc extends FlattenMaps<UserNotificationDocument> {
  _id: Types.ObjectId;
  notification_id: Types.ObjectId;
  is_read: boolean;
  read_at: Date | null;
  payload: {
    type: NotificationType;
    title: string;
    content: string;
    target_type?: ETargetType;
    target_id?: string;
  };
  created_at: Date;
}

@Injectable()
export class MongoNotificationReadService implements INotificationReadService {
  constructor(
    @InjectModel(UserNotificationModel.name)
    private readonly userNotificationModel: Model<UserNotificationDocument>,
  ) {}

  async findAll(
    filters: NotificationFilterDto = {},
  ): Promise<PaginatedResponseDto<NotificationDto>> {
    const { cursor, limit = 10, recipientId, isRead } = filters;
    const matchStage: QueryFilter<UserNotificationDocument> = {
      delete_at: null,
    };

    if (recipientId) {
      matchStage.recipient_id = new Types.ObjectId(recipientId);
    }

    if (isRead !== undefined) {
      matchStage.is_read = isRead;
    }

    if (cursor) {
      matchStage._id = { $lt: new Types.ObjectId(cursor) };
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $sort: { _id: -1 } },
      { $limit: limit + 1 },
      {
        $lookup: {
          from: 'notifications',
          localField: 'notification_id',
          foreignField: '_id',
          as: 'payload',
        },
      },
      { $unwind: '$payload' },
    ];

    const docs = await this.userNotificationModel.aggregate(pipeline).exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage
      ? results[results.length - 1]._id.toString()
      : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc as unknown as RawNotificationDoc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  async findById(id: string): Promise<Nullable<NotificationDto>> {
    if (!Types.ObjectId.isValid(id)) return null;

    const results = await this.userNotificationModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'notifications',
            localField: 'notification_id',
            foreignField: '_id',
            as: 'payload',
          },
        },
        { $unwind: '$payload' },
      ])
      .exec();

    const doc = results[0];
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: RawNotificationDoc): NotificationDto {
    return {
      id: doc._id.toString(),
      notificationId: doc.notification_id.toString(),
      type: doc.payload.type,
      title: doc.payload.title,
      content: doc.payload.content,
      targetType: doc.payload.target_type || null,
      targetId: doc.payload.target_id || null,
      isRead: doc.is_read,
      readAt: doc.read_at ? doc.read_at.toISOString() : null,
      createdAt: doc.created_at?.toISOString(),
    };
  }
}
