import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserNotificationRepository } from '@/core/interfaces/repositories';
import { UserNotificationRoot } from '@/core/aggregate-roots';
import { UserNotificationModel, UserNotificationDocument } from '../schemas';
import { Nullable } from '@/core/types';

@Injectable()
export class MongoUserNotificationRepository implements IUserNotificationRepository {
  constructor(
    @InjectModel(UserNotificationModel.name)
    private readonly userNotificationModel: Model<UserNotificationDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<UserNotificationRoot>> {
    const doc = await this.userNotificationModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(userNotification: UserNotificationRoot): Promise<void> {
    const data = this.mapToPersistence(userNotification);

    if (!userNotification.id) {
      const created = new this.userNotificationModel(data);
      const saved = await created.save();
      userNotification.setId(saved._id.toString());
    } else {
      await this.userNotificationModel.findByIdAndUpdate(userNotification.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.userNotificationModel.findByIdAndDelete(id).exec();
  }

  async saveMany(userNotifications: UserNotificationRoot[]): Promise<void> {
    if (userNotifications.length === 0) return;
    const documents = userNotifications.map(un => this.mapToPersistence(un));
    const result = await this.userNotificationModel.insertMany(documents);
    // Assign generated IDs back to aggregates
    userNotifications.forEach((un, idx) => {
      un.setId(result[idx]._id.toString());
    });
  }

  async markAllRead(recipientId: string): Promise<void> {
    await this.userNotificationModel.updateMany(
      { recipient_id: new Types.ObjectId(recipientId), is_read: false } as any,
      { $set: { is_read: true, read_at: new Date() } }
    ).exec();
  }

  private mapToDomain(doc: UserNotificationDocument): UserNotificationRoot {
    return UserNotificationRoot.instantiate(doc._id.toString(), {
      notificationId: doc.notification_id.toString(),
      recipientId: doc.recipient_id.toString(),
      isRead: doc.is_read,
      readAt: doc.read_at,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(userNotification: UserNotificationRoot): any {
    const data: any = {
      notification_id: new Types.ObjectId(userNotification.notificationId),
      recipient_id: new Types.ObjectId(userNotification.recipientId),
      is_read: userNotification.isRead,
      read_at: userNotification.readAt,
      delete_at: userNotification.deleteAt,
      delete_by: userNotification.deleteBy,
    };
    if (userNotification.id) {
      data._id = new Types.ObjectId(userNotification.id);
    }
    return data;
  }
}
