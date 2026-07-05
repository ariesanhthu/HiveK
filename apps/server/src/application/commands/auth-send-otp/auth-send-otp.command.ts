import { AuthSendOtpInputDto } from './auth-send-otp.dto';

export class AuthSendOtpCommand {
  constructor(
    public readonly input: AuthSendOtpInputDto,
    public readonly userId?: string,
  ) {}
}
