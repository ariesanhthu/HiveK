import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IOtpRepository } from '@/core/interfaces/repositories/otp.repository';
import { OtpModel, OtpDocument } from '../schemas/otp.schema';
import { EOtpType } from '@/core/enums/otp-type.enum';

@Injectable()
export class MongoOtpRepository implements IOtpRepository {
  constructor(
    @InjectModel(OtpModel.name)
    private readonly otpModel: Model<OtpDocument>,
  ) {}

  async save(email: string, code: string, type: EOtpType, expiresAt: Date): Promise<void> {
    await this.otpModel.create({
      email,
      code,
      type,
      expired_at: expiresAt,
    });
  }

  async findValidOtp(email: string, code: string, type: EOtpType): Promise<any | null> {
    return this.otpModel.findOne({
      email,
      code,
      type,
      expired_at: { $gt: new Date() },
    }).lean().exec();
  }

  async deleteByEmailAndType(email: string, type: EOtpType): Promise<void> {
    await this.otpModel.deleteMany({
      email,
      type,
    }).exec();
  }

  async findRecentOtp(email: string, type: EOtpType, withinSeconds: number): Promise<any | null> {
    const cutoffDate = new Date(Date.now() - withinSeconds * 1000);
    return this.otpModel.findOne({
      email: email.toLowerCase().trim(),
      type,
      created_at: { $gt: cutoffDate },
    }).lean().exec();
  }
}
