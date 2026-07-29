import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentVoidAuthorizationCommand } from './payment-void-authorization.command';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '@/core/interfaces/repositories';
import {
  PAYMENT_PROVIDER_REPOSITORY,
  type IPaymentProviderRepository,
} from '@/core/interfaces/repositories';
import {
  PAYMENT_PROVIDER_DISCOVERY,
  type IPaymentProviderDiscovery,
} from '@/core/interfaces/services/payment-provider-discovery.interface';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { PaymentService } from '@/application/services';
import { PaymentTransactionEntity } from '@/core/entities';
import {
  EPaymentTransactionType,
  ETransactionSource,
  ETransactionStatus,
  ECurrency,
} from '@/core/enums';
import { MoneyVO } from '@/core/value-objects';
import { PaymentNotFoundException } from '@/core/exceptions';

@CommandHandler(PaymentVoidAuthorizationCommand)
export class PaymentVoidAuthorizationHandler implements ICommandHandler<
  PaymentVoidAuthorizationCommand,
  void
> {
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

  async execute(command: PaymentVoidAuthorizationCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Fetch payment
      const payment = await this.paymentRepository.findById(input.paymentId);
      if (!payment) {
        throw new PaymentNotFoundException(input.paymentId);
      }

      const attempt = payment.getLatestAttempt();
      if (!attempt) {
        throw new Error(`No payment attempts found for payment: ${payment.id}`);
      }

      const providerTransactionId = attempt.providerTransactionId;
      if (!providerTransactionId) {
        throw new Error('No provider transaction ID exists to void.');
      }

      // 2. Resolve provider strategy
      const provider = await this.providerRepository.findById(
        attempt.paymentProviderId,
      );
      if (!provider) {
        throw new Error('Payment provider not found.');
      }

      const providerInstance = this.providerDiscovery.findProvider(
        provider.code,
      );
      if (!providerInstance) {
        throw new Error(
          `Payment provider strategy not found for: ${provider.code}`,
        );
      }

      // 3. Call gateway cancel (void authorization) API
      const result = await providerInstance.cancel(
        providerTransactionId,
        payment.amount.amount,
        payment.amount.currency,
      );

      // 4. Record CANCEL/VOID transaction
      const transaction = PaymentTransactionEntity.fromProvider({
        transactionType: EPaymentTransactionType.CANCEL,
        transactionSource: ETransactionSource.API,
        status: result.data.isSuccess
          ? ETransactionStatus.SUCCESS
          : ETransactionStatus.FAILED,
        amount: payment.amount,
        providerTransactionId:
          result.data.transactionId || providerTransactionId,
        requestPayload: result.requestPayload,
        responsePayload: result.responsePayload,
        requestHeaders: result.requestHeaders as Record<string, string>,
        responseHeaders: result.responseHeaders as Record<string, string>,
        requestTimestamp: result.requestTimestamp,
        responseTimestamp: result.responseTimestamp,
        description: input.reason || 'Void authorization request',
      });

      this.paymentService.processTransaction(payment, attempt.id, transaction);

      // 5. Update status locally
      if (result.data.isSuccess) {
        this.paymentService.cancelPayment(
          payment,
          input.reason || 'Authorization voided successfully',
          input.voidedBy || 'system',
        );
      }

      await this.paymentRepository.save(payment);
    });
  }
}
