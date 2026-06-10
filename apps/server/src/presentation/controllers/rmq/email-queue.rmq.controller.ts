import { Controller, Inject } from '@nestjs/common';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { type ILoggerService, LOGGER_SERVICE, MAILER_SERVICE, type IMailerService } from '@/application/interfaces';

@Controller()
export class EmailRmqController {
  constructor(
    @Inject(MAILER_SERVICE)
    private readonly mailerService: IMailerService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService
  ) {
    this.logger.setContext(EmailRmqController.name)
  }

  @RmqHandler({ queue: 'email_queue', pattern: 'email.send' })
  async handleSendEmail(data: any): Promise<void> {
    const { email, code, type, subject, template, context } = data;

    this.logger.log(`Processing email request for ${email}`);
    
    // Legacy support for OTP type
    if (type) {
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
        default:
          purpose = 'Verification';
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
      return;
    }

    // Generic email sending
    await this.mailerService.sendMail({
      to: email,
      subject: subject,
      template: template,
      context: context,
    });
  }
}
