import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IEnterpriseInvitationRepository } from '@/core/interfaces/repositories';
import { EnterpriseInvitationRoot } from '@/core/aggregate-roots';
import { EnterpriseInvitationModel, EnterpriseInvitationDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { EEnterpriseInvitationStatus } from '@/core/enums';

@Injectable()
export class MongoEnterpriseInvitationRepository implements IEnterpriseInvitationRepository {
  constructor(
    @InjectModel(EnterpriseInvitationModel.name)
    private readonly invitationModel: Model<EnterpriseInvitationDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<EnterpriseInvitationRoot>> {
    const doc = await this.invitationModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEmailAndEnterpriseId(email: string, enterpriseId: string): Promise<Nullable<EnterpriseInvitationRoot>> {
    const doc = await this.invitationModel.findOne({
      email: email.toLowerCase(),
      enterprise_id: new Types.ObjectId(enterpriseId),
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findPendingByEmailAndEnterpriseId(email: string, enterpriseId: string): Promise<Nullable<EnterpriseInvitationRoot>> {
    const doc = await this.invitationModel.findOne({
      email: email.toLowerCase(),
      enterprise_id: new Types.ObjectId(enterpriseId),
      status: EEnterpriseInvitationStatus.PENDING,
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<EnterpriseInvitationRoot[]> {
    const docs = await this.invitationModel.find({
      enterprise_id: new Types.ObjectId(enterpriseId),
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async save(invitation: EnterpriseInvitationRoot): Promise<void> {
    const data = this.mapToPersistence(invitation);

    if (!invitation.id) {
      const created = new this.invitationModel(data);
      const saved = await created.save({ session: this.session });
      invitation.setId(saved._id.toString());
    } else {
      await this.invitationModel.findByIdAndUpdate(invitation.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(invitations: EnterpriseInvitationRoot[]): Promise<void> {
    await Promise.all(invitations.map(i => this.save(i)));
  }

  async delete(id: string): Promise<void> {
    await this.invitationModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: EnterpriseInvitationDocument): EnterpriseInvitationRoot {
    return EnterpriseInvitationRoot.instantiate(doc._id.toString(), {
      enterpriseId: doc.enterprise_id.toString(),
      email: doc.email,
      mode: doc.mode,
      inviterId: doc.inviter_id.toString(),
      status: doc.status,
      expiresAt: doc.expires_at,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(invitation: EnterpriseInvitationRoot): Omit<EnterpriseInvitationModel, 'created_at' | 'updated_at'> {
    return {
      enterprise_id: new Types.ObjectId(invitation.enterpriseId),
      email: invitation.email.toLowerCase(),
      mode: invitation.mode,
      inviter_id: new Types.ObjectId(invitation.inviterId),
      status: invitation.status,
      expires_at: invitation.expiresAt,
    };
  }
}
