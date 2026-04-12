import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IEnterpriseReadService } from '@/application/interfaces';
import { EnterpriseDto } from '@/application/enterprises/dtos';
import { EnterpriseModel, type EnterpriseDocument } from '../schemas/enterprise.schema';
import { Nullable, JsonRecord } from '@/shared/types';

@Injectable()
export class MongoEnterpriseReadService implements IEnterpriseReadService {
  constructor(
    @InjectModel(EnterpriseModel.name)
    private readonly enterpriseModel: Model<EnterpriseDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<EnterpriseDto>> {
    const doc = await this.enterpriseModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByUserId(userId: string): Promise<Nullable<EnterpriseDto>> {
    const doc = await this.enterpriseModel.findOne({ user_id: userId }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters?: JsonRecord): Promise<EnterpriseDto[]> {
    const docs = await this.enterpriseModel.find(filters || {}).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  private mapToDto(doc: any): EnterpriseDto {
    return {
      id: doc._id.toString(),
      userId: doc.user_id,
      companyName: doc.company_name,
      description: doc.description,
      contactEmail: doc.contact_email,
      contactPhone: doc.contact_phone,
      website: doc.website,
      taxId: doc.tax_id,
      logoUrl: doc.logo_url,
      isVerified: doc.is_verified,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }
}
