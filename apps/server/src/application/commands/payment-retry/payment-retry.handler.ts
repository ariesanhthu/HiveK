import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentRetryCommand } from './payment-retry.command';
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
} from '@/core/enums';
import { PaymentNotFoundException } from '@/core/exceptions';

@CommandHandler(PaymentRetryCommand)
export class PaymentRetryHandler implements ICommandHandler<
  PaymentRetryCommand,
  { paymentUrl?: string }
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

  async execute(
    command: PaymentRetryCommand,
  ): Promise<{ paymentUrl?: string }> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Fetch payment
      const payment = await this.paymentRepository.findById(input.paymentId);
      if (!payment) {
        throw new PaymentNotFoundException(input.paymentId);
      }

      // 2. Initiate retry state transitions
      const attemptId = this.paymentService.initiateRetry(
        payment,
        input.paymentProviderId,
        input.idempotencyKey,
      );

      await this.paymentRepository.save(payment);

      // 3. Load provider & call gateway
      const provider = await this.providerRepository.findById(
        input.paymentProviderId,
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

      const result = await providerInstance.create(
        attemptId,
        payment.amount.amount,
        payment.amount.currency,
      );

      // 4. Record CREATE transaction
      const transaction = PaymentTransactionEntity.fromProvider({
        transactionType: EPaymentTransactionType.CREATE,
        transactionSource: ETransactionSource.API,
        status: result.data.isSuccess
          ? ETransactionStatus.SUCCESS
          : ETransactionStatus.FAILED,
        amount: payment.amount,
        requestPayload: result.requestPayload,
        responsePayload: result.responsePayload,
        requestHeaders: result.requestHeaders as any,
        responseHeaders: result.responseHeaders as any,
        requestTimestamp: result.requestTimestamp,
        responseTimestamp: result.responseTimestamp,
        providerTransactionId: result.data.transactionId,
        description: 'Retry Payment URL request',
      });

      this.paymentService.processTransaction(payment, attemptId, transaction);

      if (result.paymentUrl) {
        payment.setPaymentUrl(result.paymentUrl);
      }

      await this.paymentRepository.save(payment);

      return { paymentUrl: result.paymentUrl || undefined };
    });
  }
}
