import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { INotificationRepository } from '@/core/interfaces/repositories';
import { NotificationRoot } from '@/core/aggregate-roots';
import { NotificationModel, NotificationDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoNotificationRepository implements INotificationRepository {
  constructor(
    @InjectModel(NotificationModel.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<NotificationRoot>> {
    const doc = await this.notificationModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(notification: NotificationRoot): Promise<void> {
    const data = this.mapToPersistence(notification);

    if (!notification.id) {
      const created = new this.notificationModel(data);
      const saved = await created.save({ session: this.session });
      notification.setId(saved._id.toString());
    } else {
      await this.notificationModel.findByIdAndUpdate(notification.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(notifications: NotificationRoot[]): Promise<void> {
    await Promise.all(notifications.map(n => this.save(n)));
  }

  async delete(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: NotificationDocument): NotificationRoot {
    if (!doc._id) {
      throw new Error('Notification document ID is missing');
    }
    return NotificationRoot.instantiate(doc._id.toString(), {
      type: doc.type,
      title: doc.title,
      content: doc.content,
      targetType: doc.target_type,
      targetId: doc.target_id,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(notification: NotificationRoot): Omit<NotificationModel, 'created_at' | 'updated_at'> {
    return {
      type: notification.type,
      title: notification.title,
      content: notification.content,
      target_type: notification.targetType,
      target_id: notification.targetId,
    };
  }
}
