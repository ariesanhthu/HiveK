import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IUserNotificationRepository } from '@/core/interfaces/repositories';
import { UserNotificationRoot } from '@/core/aggregate-roots';
import { UserNotificationModel, UserNotificationDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoUserNotificationRepository implements IUserNotificationRepository {
  constructor(
    @InjectModel(UserNotificationModel.name)
    private readonly userNotificationModel: Model<UserNotificationDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<UserNotificationRoot>> {
    const doc = await this.userNotificationModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(userNotification: UserNotificationRoot): Promise<void> {
    const data = this.mapToPersistence(userNotification);

    if (!userNotification.id) {
      const created = new this.userNotificationModel(data);
      const saved = await created.save({ session: this.session });
      userNotification.setId(saved._id.toString());
    } else {
      await this.userNotificationModel.findByIdAndUpdate(userNotification.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.userNotificationModel.findByIdAndDelete(id).session(this.session).exec();
  }

  async saveMany(userNotifications: UserNotificationRoot[]): Promise<void> {
    if (userNotifications.length === 0) return;
    const documents = userNotifications.map(un => this.mapToPersistence(un));
    const result = await this.userNotificationModel.insertMany(documents, { session: this.session });
    // Assign generated IDs back to aggregates
    userNotifications.forEach((un, idx) => {
      un.setId(result[idx]._id.toString());
    });
  }

  async markAll(recipientId: string, isRead: boolean): Promise<void> {
    const update = isRead 
      ? { $set: { is_read: true, read_at: new Date() } }
      : { $set: { is_read: false, read_at: null } };

    await this.userNotificationModel.updateMany(
      { recipient_id: new Types.ObjectId(recipientId), is_read: !isRead } as Record<string, unknown>,
      update
    ).session(this.session).exec();
  }

  async updateReadStatus(ids: string[], recipientId: string, isRead: boolean): Promise<void> {
    const update = isRead 
      ? { $set: { is_read: true, read_at: new Date() } }
      : { $set: { is_read: false, read_at: null } };

    await this.userNotificationModel.updateMany(
      { 
        _id: { $in: ids.map(id => new Types.ObjectId(id)) },
        recipient_id: new Types.ObjectId(recipientId)
      } as Record<string, unknown>,
      update
    ).session(this.session).exec();
  }

  async softDeleteMany(ids: string[], recipientId: string, deletedBy: string): Promise<void> {
    await this.userNotificationModel.updateMany(
      { 
        _id: { $in: ids.map(id => new Types.ObjectId(id)) },
        recipient_id: new Types.ObjectId(recipientId)
      } as Record<string, unknown>,
      { $set: { delete_at: new Date(), delete_by: deletedBy } }
    ).session(this.session).exec();
  }

  async restoreMany(ids: string[], recipientId: string): Promise<void> {
    await this.userNotificationModel.updateMany(
      { 
        _id: { $in: ids.map(id => new Types.ObjectId(id)) },
        recipient_id: new Types.ObjectId(recipientId)
      } as Record<string, unknown>,
      { $set: { delete_at: null, delete_by: null } }
    ).session(this.session).exec();
  }

  async hardDeleteMany(ids: string[], recipientId: string): Promise<void> {
    await this.userNotificationModel.deleteMany({
      _id: { $in: ids.map(id => new Types.ObjectId(id)) },
      recipient_id: new Types.ObjectId(recipientId)
    } as Record<string, unknown>).session(this.session).exec();
  }

  private mapToDomain(doc: UserNotificationDocument): UserNotificationRoot {
    if (!doc._id) {
      throw new Error('UserNotification document ID is missing');
    }
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

  private mapToPersistence(userNotification: UserNotificationRoot): Record<string, unknown> & { _id?: Types.ObjectId } {
    const data: Record<string, unknown> & { _id?: Types.ObjectId } = {
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
