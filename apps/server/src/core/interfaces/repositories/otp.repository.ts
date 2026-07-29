import { EOtpType } from '@/core/enums/otp-type.enum';
import { OtpRoot } from '../../aggregate-roots/otp.aggregate';

export interface IOtpRepository {
  save(otp: OtpRoot): Promise<void>;
  saveMany(otps: OtpRoot[]): Promise<void>;
  findValidOtp(
    email: string,
    code: string,
    type: EOtpType,
  ): Promise<OtpRoot | null>;
  deleteByEmailAndType(email: string, type: EOtpType): Promise<void>;
  findRecentOtp(
    email: string,
    type: EOtpType,
    withinSeconds: number,
  ): Promise<OtpRoot | null>;
}

export const OTP_REPOSITORY = Symbol('IOtpRepository');
