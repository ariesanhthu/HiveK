import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession, Types } from 'mongoose';
import { IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { OtpModel, OtpDocument } from '../schemas/otp.schema';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { OtpRoot } from '@/core/aggregate-roots/otp.aggregate';

@Injectable()
export class MongoOtpRepository implements IOtpRepository {
  constructor(
    @InjectModel(OtpModel.name)
    private readonly otpModel: Model<OtpDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  private mapToDomain(doc: OtpDocument | null): OtpRoot | null {
    if (!doc) return null;
    return OtpRoot.instantiate(doc._id.toString(), {
      email: doc.email,
      code: doc.code,
      type: doc.type as EOtpType,
      expiresAt: doc.expired_at,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  async save(otp: OtpRoot): Promise<void> {
    const data = this.mapToPersistence(otp);
    if (!otp.id) {
      const created = new this.otpModel(data);
      const saved = await created.save({ session: this.session });
      if (saved._id) {
        otp.setId(saved._id.toString());
      }
      return;
    }
    const filter = { _id: otp.id };
    const update = {
      email: otp.email,
      code: otp.code,
      type: otp.type,
      expired_at: otp.expiresAt,
    };
    await this.otpModel.findOneAndUpdate(
      filter,
      { $set: update },
      { upsert: true, session: this.session }
    ).exec();
  }

  async saveMany(otps: OtpRoot[]): Promise<void> {
    const bulkOps = otps.map(otp => ({
      updateOne: {
        filter: { _id: otp.id },
        update: {
          $set: {
            email: otp.email,
            code: otp.code,
            type: otp.type,
            expired_at: otp.expiresAt,
          } as Record<string, unknown>,
        },
        upsert: true,
      }
    }));
    if (bulkOps.length > 0) {
      await this.otpModel.bulkWrite(bulkOps, { session: this.session });
    }
  }

  async findValidOtp(email: string, code: string, type: EOtpType): Promise<OtpRoot | null> {
    const doc = await this.otpModel.findOne({
      email,
      code,
      type,
      expired_at: { $gt: new Date() },
    }).session(this.session).lean().exec();
    return this.mapToDomain(doc);
  }

  async deleteByEmailAndType(email: string, type: EOtpType): Promise<void> {
    await this.otpModel.deleteMany({
      email,
      type,
    }).session(this.session).exec();
  }

  async findRecentOtp(email: string, type: EOtpType, withinSeconds: number): Promise<OtpRoot | null> {
    const cutoffDate = new Date(Date.now() - withinSeconds * 1000);
    const doc = await this.otpModel.findOne({
      email: email.toLowerCase().trim(),
      type,
      created_at: { $gt: cutoffDate },
    }).session(this.session).lean().exec();
    return this.mapToDomain(doc);
  }

  private mapToPersistence(otp: OtpRoot): Partial<OtpModel> & { _id?: Types.ObjectId } {
    return {
      _id: otp.id ? new Types.ObjectId(otp.id) : undefined,
      email: otp.email,
      code: otp.code,
      type: otp.type,
      expired_at: otp.expiresAt,
      created_at: otp.createdAt,
      updated_at: otp.updatedAt,
    };
  }
}
