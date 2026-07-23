import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { TargetType } from '@/core/enums/target-type.enum';
import { IUploadedFileRepository } from '@/core/interfaces/repositories';
import { Nullable } from '@/core/types';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { MongoUnitOfWork } from '../mongo-uow';
import { UploadedFileDocument, UploadedFileModel } from '../schemas';

@Injectable()
export class MongoUploadedFileRepository implements IUploadedFileRepository {
  constructor(
    @InjectModel(UploadedFileModel.name) private readonly model: Model<UploadedFileDocument>,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<UploadedFileRoot>> {
    const doc = await this.model.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByTarget(targetId: string, targetType: TargetType): Promise<UploadedFileRoot[]> {
    const docs = await this.model.find({ target_id: targetId, target_type: targetType }).session(
      this.session,
    ).exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async save(root: UploadedFileRoot): Promise<void> {
    const data = this.mapToPersistence(root);

    if (!root.id) {
      const created = new this.model(data);
      const saved = await created.save({ session: this.session });
      root.setId(saved._id.toString());
    } else {
      await this.model.findByIdAndUpdate(root.id, data, { upsert: true }).session(this.session)
        .exec();
    }
  }

  async saveMany(roots: UploadedFileRoot[]): Promise<void> {
    await Promise.all(roots.map(r => this.save(r)));
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: UploadedFileDocument): UploadedFileRoot {
    if (!doc._id) {
      throw new Error('UploadedFile document ID is missing');
    }
    return UploadedFileRoot.instantiate(doc._id.toString(), {
      url: doc.url,
      publicId: doc.public_id,
      size: doc.size,
      format: doc.format,
      title: doc.title,
      targetType: doc.target_type,
      targetId: doc.target_id,
      targetField: doc.target_field,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(
    root: UploadedFileRoot,
  ): Omit<UploadedFileModel, 'created_at' | 'updated_at'> {
    return {
      url: root.url,
      public_id: root.publicId,
      size: root.size,
      format: root.format,
      title: root.title,
      target_type: root.targetType,
      target_id: root.targetId,
      target_field: root.targetField,
      delete_at: root.deleteAt,
      delete_by: root.deleteBy,
    };
  }
}
