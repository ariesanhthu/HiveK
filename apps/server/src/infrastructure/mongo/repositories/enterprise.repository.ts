import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { EnterpriseModel, EnterpriseDocument } from '../schemas';
import { Nullable } from '@/core/types';

@Injectable()
export class MongoEnterpriseRepository implements IEnterpriseRepository {
  constructor(
    @InjectModel(EnterpriseModel.name)
    private readonly enterpriseModel: Model<EnterpriseDocument>,
  ) { }

  async findById(id: string): Promise<Nullable<EnterpriseRoot>> {
    const doc = await this.enterpriseModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Nullable<EnterpriseRoot>> {
    const doc = await this.enterpriseModel.findOne({ user_id: userId }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(enterprise: EnterpriseRoot): Promise<void> {
    const data = this.mapToPersistence(enterprise);

    if (!enterprise.id) {
      const created = new this.enterpriseModel(data);
      const saved = await created.save();
      enterprise.setId(saved._id.toString());
    } else {
      await this.enterpriseModel.findByIdAndUpdate(enterprise.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.enterpriseModel.findByIdAndDelete(id).exec();
  }

  private mapToDomain(doc: EnterpriseDocument): EnterpriseRoot {
    return EnterpriseRoot.instantiate(doc._id.toString(), {
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
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(enterprise: EnterpriseRoot): any {
    return {
      user_id: enterprise.userId,
      company_name: enterprise.companyName,
      description: enterprise.description,
      contact_email: enterprise.contactEmail,
      contact_phone: enterprise.contactPhone,
      website: enterprise.website,
      tax_id: enterprise.taxId,
      logo_url: enterprise.logoUrl,
      is_verified: enterprise.isVerified,
      delete_at: enterprise.deleteAt,
      delete_by: enterprise.deleteBy,
    };
  }
}
