import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRoleReadService } from '@/application/interfaces';
import { RoleDto } from '@/application/role/dtos';
import { RoleDocument, RoleModel } from '../schemas/role.schema';
import { Nullable, JsonRecord } from '@/shared/types';

@Injectable()
export class MongoRoleReadService implements IRoleReadService {
  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<RoleDto>> {
    const doc = await this.roleModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByTitle(title: string): Promise<Nullable<RoleDto>> {
    const doc = await this.roleModel.findOne({ title }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters?: JsonRecord): Promise<RoleDto[]> {
    const docs = await this.roleModel.find(filters || {}).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  private mapToDto(doc: any): RoleDto {
    return {
      id: doc._id.toString(),
      title: doc.title,
      permissions: doc.permissions,
      isBlocked: doc.is_blocked,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }
}
