import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentCreateCommand } from './payment-create.command';
import { PaymentCreateResponseDto } from './payment-create.dto';
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '@/core/interfaces/repositories';
import { BILL_REPOSITORY, type IBillRepository } from '@/core/interfaces/repositories';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core/interfaces/repositories';
import { PAYMENT_PROVIDER_DISCOVERY, type IPaymentProviderDiscovery } from '@/core/interfaces/services/payment-provider-discovery.interface';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { PaymentService } from '@/application/services';
import { PaymentEntity } from '@/core/aggregate-roots';
import { PaymentAttemptEntity, PaymentTransactionEntity } from '@/core/entities';
import { EBillStatus, EPaymentStatus, EPaymentAttemptStatus, EPaymentTransactionType, ETransactionSource, ETransactionStatus, ECurrency } from '@/core/enums';
import { PaymentAttemptStatusVO, MoneyVO, PaymentStatusVO } from '@/core/value-objects';
import { PaymentException, BillNotFoundException } from '@/core/exceptions';

@CommandHandler(PaymentCreateCommand)
export class PaymentCreateHandler implements ICommandHandler<PaymentCreateCommand, PaymentCreateResponseDto> {
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

  async execute(command: PaymentCreateCommand): Promise<PaymentCreateResponseDto> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Idempotency Check
      const existingPayment = await this.paymentRepository.findByIdempotencyKey(input.idempotencyKey);
      if (existingPayment) {
        if (existingPayment.billId !== input.billId) {
          throw new PaymentException('Idempotency key conflict: existing payment is associated with a different bill.');
        }
        const latestAttempt = existingPayment.getLatestAttempt();
        return {
          paymentId: existingPayment.id!,
          attemptId: latestAttempt?.id || '',
          paymentUrl: existingPayment.getPaymentUrl() || undefined,
        };
      }

      // 2. Bill Status Check
      const bill = await this.billRepository.findById(input.billId);
      if (!bill) {
        throw new BillNotFoundException(input.billId);
      }
      if (bill.enterpriseId !== input.enterpriseId) {
        throw new Error('Bill enterprise mismatch.');
      }
      if (bill.status !== EBillStatus.PENDING) {
        throw new Error(`Cannot pay bill with status: ${bill.status}`);
      }

      // 3. Active Payment Check
      const hasActive = await this.paymentRepository.hasActivePaymentForBill(input.billId);
      if (hasActive) {
        throw new PaymentException('Bill already has an active payment.');
      }

      // 4. Create Payment Entity
      const firstAttempt = PaymentAttemptEntity.create({
        paymentProviderId: input.paymentProviderId,
        attemptNumber: 1,
        status: new PaymentAttemptStatusVO(EPaymentAttemptStatus.INITIATED),
        providerTransactionId: undefined,
        paymentUrl: undefined,
        failureReason: undefined,
        failureType: undefined,
        totalRefundedAmount: MoneyVO.zero(input.currency),
        transactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        idempotencyKey: input.idempotencyKey,
      });

      const payment = PaymentEntity.create({
        enterpriseId: input.enterpriseId,
        userId: input.userId || null,
        billId: input.billId,
        amount: new MoneyVO(input.amount, input.currency),
        status: new PaymentStatusVO(EPaymentStatus.PENDING),
        paymentAttempts: [firstAttempt],
        description: input.description || undefined,
        idempotencyKey: input.idempotencyKey,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: input.metadata || {},
      });

      await this.paymentRepository.save(payment);
      const attemptId = payment.getLatestAttempt()?.id;
      if (!attemptId) {
        throw new PaymentException('Failed to create first payment attempt.');
      }

      // 5. Load Provider and call Gateway API
      const provider = await this.providerRepository.findById(input.paymentProviderId);
      if (!provider) {
        throw new Error('Payment provider not found.');
      }

      const providerInstance = this.providerDiscovery.findProvider(provider.code);
      if (!providerInstance) {
        throw new Error(`Payment provider strategy not found for: ${provider.code}`);
      }

      const result = await providerInstance.create(
        attemptId,
        payment.amount.amount,
        payment.amount.currency
      );

      // 6. Record transaction and update payment URL
      const transaction = PaymentTransactionEntity.fromProvider({
        transactionType: EPaymentTransactionType.CREATE,
        transactionSource: ETransactionSource.API,
        status: result.data.isSuccess ? ETransactionStatus.SUCCESS : ETransactionStatus.FAILED,
        amount: payment.amount,
        requestPayload: result.requestPayload,
        responsePayload: result.responsePayload,
        requestHeaders: result.requestHeaders as any,
        responseHeaders: result.responseHeaders as any,
        requestTimestamp: result.requestTimestamp,
        responseTimestamp: result.responseTimestamp,
        providerTransactionId: result.data.transactionId,
        description: 'Payment URL request',
      });

      this.paymentService.processTransaction(payment, attemptId, transaction);

      if (result.paymentUrl) {
        payment.setPaymentUrl(result.paymentUrl);
      }

      await this.paymentRepository.save(payment);

      return {
        paymentId: payment.id!,
        attemptId,
        paymentUrl: result.paymentUrl || undefined,
      };
    });
  }
}
