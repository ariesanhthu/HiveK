import { AuthVerifyOtpInputDto } from './auth-verify-otp.dto';

export class AuthVerifyOtpCommand {
  constructor(public readonly input: AuthVerifyOtpInputDto) {}
}
