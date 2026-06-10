import { Controller, Inject } from '@nestjs/common';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { type ILoggerService, LOGGER_SERVICE, MAILER_SERVICE, type IMailerService } from '@/application/interfaces';

@Controller()
export class AuthEmailRmqController {
  constructor(
    @Inject(MAILER_SERVICE)
    private readonly mailerService: IMailerService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService
  ) {
    this.logger.setContext(AuthEmailRmqController.name)
  }

  @RmqHandler({ queue: 'auth_email_queue', pattern: 'auth.email.send.otp' })
  async handleSendOtp(data: any): Promise<void> {
    const { email, code, type } = data;

    this.logger.log(`Sending OTP to ${email}`);
    this.logger.debug(`Data: ${JSON.stringify(data)}`);
    
    // Logic from AuthSendOtpCommandHandler
    let purpose = '';
    switch (type) {
      case 'create_account':
        purpose = 'Create Account';
        break;
      case 'reset_password':
        purpose = 'Reset Password';
        break;
      case 'change_password':
        purpose = 'Change Password';
        break;
    }

    await this.mailerService.sendMail({
      to: email,
      subject: `HiveK Verification Code - ${purpose}`,
      template: 'otp',
      context: {
        code,
        purpose,
      },
    });
  }
}
