import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUploadedFileRepository } from '@/core/interfaces/repositories';
import { UploadedFileRoot } from '@/core/aggregate-roots';
import { UploadedFileModel, UploadedFileDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { TargetType } from '@/core/enums/target-type.enum';

@Injectable()
export class MongoUploadedFileRepository implements IUploadedFileRepository {
  constructor(
    @InjectModel(UploadedFileModel.name)
    private readonly model: Model<UploadedFileDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<UploadedFileRoot>> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByTarget(targetId: string, targetType: TargetType): Promise<UploadedFileRoot[]> {
    const docs = await this.model.find({ target_id: targetId, target_type: targetType }).exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async save(root: UploadedFileRoot): Promise<void> {
    const data = this.mapToPersistence(root);

    if (!root.id) {
      const created = new this.model(data);
      const saved = await created.save();
      root.setId(saved._id.toString());
    } else {
      await this.model.findByIdAndUpdate(root.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
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

  private mapToPersistence(root: UploadedFileRoot): Omit<UploadedFileModel, 'created_at' | 'updated_at'> {
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
