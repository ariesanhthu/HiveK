import { Controller, Inject } from '@nestjs/common';
import { RmqHandler } from '@/infrastructure/rabbitmq/rmq-consumer.registry';
import { type ILoggerService, LOGGER_SERVICE, MAILER_SERVICE, type IMailerService } from '@/application/interfaces';
import type { NotifyEnterpriseInvitationPayload, SendVerificationEmailRequestedPayload } from '@/application/events';
import { CommandBus } from '@nestjs/cqrs';
import { NotificationSendCommand } from '@/application';
import { NotificationChannel, NotificationType } from '@/core/enums';
import { toDate } from '@/shared/date';

@Controller()
export class NotificationRmqController {
  constructor(
    @Inject(MAILER_SERVICE)
    private readonly mailerService: IMailerService,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext(NotificationRmqController.name)
  }

  @RmqHandler({ queue: 'notification_queue', pattern: 'notification.verification_otp' })
  async handleSendVerificationOtpEmail(data: SendVerificationEmailRequestedPayload): Promise<void> {
    const { email, otpCode, type, expireAt } = data;

    this.logger.log(`Processing email request for ${email} ...`);

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
        otpCode,
        purpose,
        expireAt: toDate(expireAt)?.toISOString(),
      },
    });

    this.logger.log(`Processing email request for ${email} done`);
    return;
  }

  @RmqHandler({ queue: 'notification_queue', pattern: 'notification.enterprise_invitation' })
  async handleSendEnterpriseInvitationEmail(data: NotifyEnterpriseInvitationPayload): Promise<void> {
    const { userId, userEmail, enterpriseName, enterpriseId } = data;

    this.logger.log(`Processing email request for ${userEmail} ...`);

    await this.commandBus.execute(
      new NotificationSendCommand({
        type: NotificationType.SYSTEM,
        title: 'Added to Enterprise',
        content: `You have been added to enterprise ${enterpriseName || enterpriseId}.`,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        audience: {
          broadcastType: 'direct',
          userIds: [userId],
        },
      })
    );

    this.logger.log(`Processing email request for ${userEmail} done`);
  }

  @RmqHandler({ queue: 'notification_queue', pattern: 'notification.enterprise_revocation' })
  async handleSendEnterpriseRevocationEmail(data: NotifyEnterpriseInvitationPayload): Promise<void> {
    const { userId, userEmail, enterpriseName, enterpriseId } = data;

    this.logger.log(`Processing revoked request for ${userEmail} ...`);

    await this.commandBus.execute(
      new NotificationSendCommand({
        type: NotificationType.SYSTEM,
        title: 'Revoked from Enterprise',
        content: `You have been revoked from enterprise ${enterpriseName || enterpriseId}.`,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        audience: {
          broadcastType: 'direct',
          userIds: [userId],
        },
      })
    );

    this.logger.log(`Processing revoke request for ${userEmail} done`);
  }
}
