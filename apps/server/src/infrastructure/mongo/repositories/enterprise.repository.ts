import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { EnterpriseModel, EnterpriseDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoEnterpriseRepository implements IEnterpriseRepository {
  constructor(
    @InjectModel(EnterpriseModel.name)
    private readonly enterpriseModel: Model<EnterpriseDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<EnterpriseRoot>> {
    const doc = await this.enterpriseModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Nullable<EnterpriseRoot>> {
    const doc = await this.enterpriseModel.findOne({ user_id: new Types.ObjectId(userId) as any }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(enterprise: EnterpriseRoot): Promise<void> {
    const data = this.mapToPersistence(enterprise);

    if (!enterprise.id) {
      const created = new this.enterpriseModel(data);
      const saved = await created.save({ session: this.session });
      enterprise.setId(saved._id.toString());
    } else {
      await this.enterpriseModel.findByIdAndUpdate(enterprise.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(enterprises: EnterpriseRoot[]): Promise<void> {
    await Promise.all(enterprises.map(e => this.save(e)));
  }

  async delete(id: string): Promise<void> {
    await this.enterpriseModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: EnterpriseDocument): EnterpriseRoot {
    if (!doc._id) {
      throw new Error('Enterprise document ID is missing');
    }
    return EnterpriseRoot.instantiate(doc._id.toString(), {
      userId: doc.user_id ? doc.user_id.toString() : '',
      companyName: doc.company_name,
      description: doc.description || undefined,
      contactEmail: doc.contact_email,
      contactPhone: doc.contact_phone ? PhoneNumberVO.create({ value: doc.contact_phone }) : undefined,
      website: doc.website || undefined,
      taxId: doc.tax_id || undefined,
      logoUrlId: doc.logo_url_id ? doc.logo_url_id.toString() : undefined,
      isVerified: doc.is_verified,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(enterprise: EnterpriseRoot): Omit<EnterpriseModel, 'created_at' | 'updated_at'> {
    return {
      user_id: new Types.ObjectId(enterprise.userId) as any,
      company_name: enterprise.companyName,
      description: enterprise.description ?? null,
      contact_email: enterprise.contactEmail,
      contact_phone: enterprise.contactPhone?.value ?? null,
      website: enterprise.website ?? null,
      tax_id: enterprise.taxId ?? null,
      logo_url_id: enterprise.logoUrlId ? new Types.ObjectId(enterprise.logoUrlId) as any : null,
      is_verified: enterprise.isVerified,
      delete_at: enterprise.deleteAt,
      delete_by: enterprise.deleteBy,
    };
  }
}
