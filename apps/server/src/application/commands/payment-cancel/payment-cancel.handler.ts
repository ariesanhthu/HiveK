import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentCancelCommand } from './payment-cancel.command';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '@/core/interfaces/repositories';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { PaymentService } from '@/application/services';
import { PaymentNotFoundException } from '@/core/exceptions';

@CommandHandler(PaymentCancelCommand)
export class PaymentCancelHandler implements ICommandHandler<
  PaymentCancelCommand,
  void
> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: PaymentCancelCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      const payment = await this.paymentRepository.findById(input.paymentId);
      if (!payment) {
        throw new PaymentNotFoundException(input.paymentId);
      }

      this.paymentService.cancelPayment(
        payment,
        input.reason || 'Canceled by user request',
        input.canceledBy || 'system',
      );

      await this.paymentRepository.save(payment);
    });
  }
}
