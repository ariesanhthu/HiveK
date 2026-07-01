import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentHandleWebhookCommand } from './payment-handle-webhook.command';
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '@/core/interfaces/repositories';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core/interfaces/repositories';
import { PAYMENT_PROVIDER_DISCOVERY, type IPaymentProviderDiscovery } from '@/core/interfaces/services/payment-provider-discovery.interface';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { PaymentService } from '@/application/services';
import { PaymentTransactionEntity } from '@/core/entities';
import { EPaymentTransactionType, ETransactionSource, ETransactionStatus, ECurrency } from '@/core/enums';
import { MoneyVO } from '@/core/value-objects';
import { PaymentNotFoundException } from '@/core/exceptions';

@CommandHandler(PaymentHandleWebhookCommand)
export class PaymentHandleWebhookHandler implements ICommandHandler<PaymentHandleWebhookCommand, { statusCode: number; payload?: Record<string, unknown> }> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(PAYMENT_PROVIDER_REPOSITORY)
    private readonly providerRepository: IPaymentProviderRepository,
    @Inject(PAYMENT_PROVIDER_DISCOVERY)
    private readonly providerDiscovery: IPaymentProviderDiscovery,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: PaymentHandleWebhookCommand): Promise<{ statusCode: number; payload?: Record<string, unknown> }> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Resolve Provider strategy & Entity
      const providerInstance = this.providerDiscovery.findProvider(input.code);
      if (!providerInstance?.verifyWebhook || !providerInstance.extractPaymentAttemptId || !providerInstance.parseWebhook) {
        throw new Error(`Provider strategy not found or incomplete for code: ${input.code}`);
      }

      const providerEntity = await this.providerRepository.findByCode(input.code);
      if (!providerEntity) {
        throw new Error(`Payment provider not found in repository for code: ${input.code}`);
      }
      if (!providerEntity.isActive) {
        throw new Error('Payment provider is deactivated.');
      }

      // 2. Extract Attempt & Payment
      const attemptId = providerInstance.extractPaymentAttemptId(input.data);
      if (!attemptId) {
        throw new Error('Could not extract payment attempt ID from webhook payload.');
      }

      const payment = await this.paymentRepository.findByAttemptId(attemptId);
      if (!payment) {
        throw new PaymentNotFoundException(attemptId);
      }

      const latestAttempt = payment.getLatestAttempt();
      if (!latestAttempt) {
        throw new Error('Payment attempt not found on payment entity.');
      }
      if (latestAttempt.paymentProviderId !== providerEntity.id) {
        throw new Error('Payment provider mismatch.');
      }

      // 3. Verify signature
      const isSignatureValid = providerInstance.verifyWebhook(input.data);
      if (!isSignatureValid) {
        throw new Error('Webhook signature verification failed.');
      }

      // 4. Parse Webhook details
      const parsed = providerInstance.parseWebhook(input.data);

      // Map action & status to EPaymentTransactionType
      const transactionType = this.mapToTransactionType(parsed.action, parsed.data.status);

      const transaction = PaymentTransactionEntity.fromProvider({
        transactionType,
        transactionSource: ETransactionSource.WEBHOOK,
        amount: new MoneyVO(parsed.amount, parsed.currency as ECurrency),
        status: parsed.data.isSuccess ? ETransactionStatus.SUCCESS : ETransactionStatus.FAILED,
        description: parsed.data.errorMessage || undefined,
        providerTransactionId: parsed.data.transactionId,
        responsePayload: parsed.rawPayload,
        responseTimestamp: new Date(),
        metadata: parsed.metadata || {},
      });

      // 5. Process Transaction State Updates
      this.paymentService.processTransaction(payment, attemptId, transaction);

      await this.paymentRepository.save(payment);

      return {
        statusCode: parsed.response.statusCode,
        payload: parsed.response.payload,
      };
    });
  }

  private mapToTransactionType(
    action: 'payment' | 'refund' | 'cancel' | 'other',
    status: 'authorized' | 'succeeded' | 'failed' | 'pending' | 'expired'
  ): EPaymentTransactionType {
    switch (action) {
      case 'payment':
        switch (status) {
          case 'authorized':
            return EPaymentTransactionType.AUTHORIZATION;
          case 'succeeded':
          case 'failed':
            return EPaymentTransactionType.CAPTURE;
          case 'expired':
            return EPaymentTransactionType.CANCEL;
          case 'pending':
            return EPaymentTransactionType.AUTHORIZATION;
          default:
            return EPaymentTransactionType.AUTHORIZATION;
        }
      case 'refund':
        return EPaymentTransactionType.REFUND;
      case 'cancel':
        return EPaymentTransactionType.CANCEL;
      default:
        return EPaymentTransactionType.AUTHORIZATION;
    }
  }
}
