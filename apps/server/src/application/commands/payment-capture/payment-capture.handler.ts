import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentCaptureCommand } from './payment-capture.command';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '@/core/interfaces/repositories';
import {
  BILL_REPOSITORY,
  type IBillRepository,
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
import {
  PaymentNotFoundException,
  BillNotFoundException,
} from '@/core/exceptions';

@CommandHandler(PaymentCaptureCommand)
export class PaymentCaptureHandler implements ICommandHandler<
  PaymentCaptureCommand,
  void
> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(BILL_REPOSITORY)
    private readonly billRepository: IBillRepository,
    @Inject(PAYMENT_PROVIDER_REPOSITORY)
    private readonly providerRepository: IPaymentProviderRepository,
    @Inject(PAYMENT_PROVIDER_DISCOVERY)
    private readonly providerDiscovery: IPaymentProviderDiscovery,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: PaymentCaptureCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Fetch payment and attempt details
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
        throw new Error('No provider transaction ID exists to capture.');
      }

      // 2. Fetch provider strategy
      const provider = await this.providerRepository.findById(
        attempt.paymentProviderId,
      );
      if (!provider) {
        throw new Error('Payment provider not found.');
      }

      const providerInstance = this.providerDiscovery.findProvider(
        provider.code,
      );
      if (!providerInstance?.capture) {
        throw new Error(
          `Provider strategy ${provider.code} does not support capture.`,
        );
      }

      // 3. Call gateway capture API
      const result = await providerInstance.capture(
        providerTransactionId,
        attempt.id,
        payment.amount.amount,
        payment.amount.currency,
      );

      // 4. Record CAPTURE transaction
      const transaction = PaymentTransactionEntity.fromProvider({
        transactionType: EPaymentTransactionType.CAPTURE,
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
        description: 'Capture transaction request',
      });

      this.paymentService.processTransaction(payment, attempt.id, transaction);

      // 5. Update bill status if capture successful
      if (result.data.isSuccess && payment.billId) {
        const bill = await this.billRepository.findById(payment.billId);
        if (!bill) {
          throw new BillNotFoundException(payment.billId);
        }
        this.paymentService.coordinateCaptureSuccess(payment, bill);
        await this.billRepository.save(bill);
      }

      await this.paymentRepository.save(payment);
    });
  }
}
