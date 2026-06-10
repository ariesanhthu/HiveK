import { EOtpType } from '@/core/enums/otp-type.enum';

export interface IOtpSaveManyInput {
  email: string;
  code: string;
  type: EOtpType;
  expiresAt: Date;
}

export interface IOtpRepository {
  save(email: string, code: string, type: EOtpType, expiresAt: Date): Promise<void>;
  saveMany(inputs: IOtpSaveManyInput[]): Promise<void>;
  findValidOtp(email: string, code: string, type: EOtpType): Promise<any | null>;
  deleteByEmailAndType(email: string, type: EOtpType): Promise<void>;
  findRecentOtp(email: string, type: EOtpType, withinSeconds: number): Promise<any | null>;
}

export const OTP_REPOSITORY = Symbol('IOtpRepository');

