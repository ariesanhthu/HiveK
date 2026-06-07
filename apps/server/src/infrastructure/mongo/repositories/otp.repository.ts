import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { OtpModel, OtpDocument } from '../schemas/otp.schema';
import { EOtpType } from '@/core/enums/otp-type.enum';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

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

  async save(email: string, code: string, type: EOtpType, expiresAt: Date): Promise<void> {
    const created = new this.otpModel({
      email,
      code,
      type,
      expired_at: expiresAt,
    });
    await created.save({ session: this.session });
  }

  async findValidOtp(email: string, code: string, type: EOtpType): Promise<any | null> {
    return this.otpModel.findOne({
      email,
      code,
      type,
      expired_at: { $gt: new Date() },
    }).session(this.session).lean().exec();
  }

  async deleteByEmailAndType(email: string, type: EOtpType): Promise<void> {
    await this.otpModel.deleteMany({
      email,
      type,
    }).session(this.session).exec();
  }

  async findRecentOtp(email: string, type: EOtpType, withinSeconds: number): Promise<any | null> {
    const cutoffDate = new Date(Date.now() - withinSeconds * 1000);
    return this.otpModel.findOne({
      email: email.toLowerCase().trim(),
      type,
      created_at: { $gt: cutoffDate },
    }).session(this.session).lean().exec();
  }
}
