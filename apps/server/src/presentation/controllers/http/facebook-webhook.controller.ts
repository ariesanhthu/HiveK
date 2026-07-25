import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebHook } from '@/presentation/decorators/webhook.decorator';
import { MESSAGE_QUEUE_SERVICE, type IMessageQueueService } from '@/application/interfaces';
import { SOCIAL_PAGE_REPOSITORY, type ISocialPageRepository } from '@/core/interfaces/repositories';
import { ConfigService } from '@nestjs/config';
import { FacebookIpGuard } from '@/presentation/middleware/guards/facebook-ip.guard';
import * as crypto from 'crypto';

@ApiTags('PUBLIC-webhooks')
@UseGuards(FacebookIpGuard)
@Controller('api/webhooks/facebook')
export class FacebookWebhookController {
  private readonly logger = new Logger(FacebookWebhookController.name);
  private readonly appSecret: string;
  private readonly verifyToken: string;
  private readonly checkSignature: boolean;

  constructor(
    @Inject(MESSAGE_QUEUE_SERVICE)
    private readonly messageQueueService: IMessageQueueService,
    @Inject(SOCIAL_PAGE_REPOSITORY)
    private readonly socialPageRepository: ISocialPageRepository,
    private readonly configService: ConfigService,
  ) {
    this.appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET') || '';
    this.verifyToken = this.configService.get<string>('FACEBOOK_WEBHOOK_VERIFY_TOKEN') || 'default-verify-token';
    this.checkSignature = this.configService.get<boolean>('FACEBOOK_WEBHOOK_SIGNATURE_VERIFICATION', false);
  }

  @WebHook()
  @Get()
  @ApiOperation({ summary: 'Verify Facebook webhook challenge' })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<string> {
    this.logger.log(`Received Facebook webhook verification: mode=${mode}, token=${token}`);

    if (mode === 'subscribe' && token) {
      if (token === this.verifyToken) {
        this.logger.log('Facebook webhook verification successful (via global token).');
        return challenge;
      }

      const socialPage = await this.socialPageRepository.findByWebhookVerifyToken(token);
      if (socialPage && socialPage.isActive) {
        this.logger.log(`Facebook webhook verification successful for page ${socialPage.pageName} (ID: ${socialPage.pageId}).`);
        return challenge;
      }
    }

    this.logger.warn('Facebook webhook verification failed: Token mismatch.');
    return 'Verification failed';
  }

  @WebHook()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Receive Facebook webhook events' })
  async handleWebhook(
    @Body() body: any,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: any,
  ): Promise<string> {
    this.logger.log('Received webhook event from Facebook');

    // 1. Verify Signature if enabled
    if (this.checkSignature && signature) {
      const rawBody = req.rawBody || JSON.stringify(body);
      const isVerified = this.verifySignature(rawBody, signature);
      if (!isVerified) {
        this.logger.warn('Facebook webhook signature verification failed.');
        return 'Signature mismatch';
      }
    }

    // 2. Loop Guard: Check sender vs page ID inside the raw controller level for early drops
    const entry = body.entry?.[0];
    const pageId = entry?.id;
    const change = entry?.changes?.[0];
    const value = change?.value;
    const senderId = value?.from?.id;

    if (pageId && senderId && pageId === senderId) {
      this.logger.debug(`Early loop guard check: dropping self-reply from pageId ${pageId}.`);
      return 'SELF_REPLY_IGNORED';
    }

    // 3. Push raw comment event into RabbitMQ for async processing
    if (value && value.item === 'comment' && value.verb === 'add') {
      try {
        this.messageQueueService.emit('webhook.facebook.comment', body);
        this.logger.log('Facebook comment event published to RabbitMQ successfully.');
      } catch (error: any) {
        this.logger.error(`Failed to publish comment webhook event to RMQ: ${error.message}`);
      }
    }

    return 'EVENT_RECEIVED';
  }

  private verifySignature(rawBody: string, signatureHeader: string): boolean {
    try {
      const signature = signatureHeader.replace('sha256=', '');
      const hmac = crypto.createHmac('sha256', this.appSecret);
      const digest = hmac.update(rawBody).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(digest, 'hex'));
    } catch {
      return false;
    }
  }
}
