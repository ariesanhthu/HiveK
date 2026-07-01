import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BillCancelCommand } from './bill-cancel.command';
import { BillCancelledEvent } from '@/core/events';
import { BILL_REPOSITORY, type IBillRepository } from '@/core/interfaces/repositories';
import { BillNotFoundException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(BillCancelCommand)
export class BillCancelHandler implements ICommandHandler<BillCancelCommand, void> {
  constructor(
    @Inject(BILL_REPOSITORY)
    private readonly billRepository: IBillRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: BillCancelCommand): Promise<void> {
    const { input } = command;

    return this.uow.execute(async () => {
      // 1. Retrieve Target Bill
      const bill = await this.billRepository.findById(input.billId);
      if (!bill) {
        throw new BillNotFoundException(input.billId);
      }

      // 2. Logic: Cancel
      bill.cancel();

      // 3. Persistence
      await this.billRepository.save(bill);

      // 4. Event
      this.eventBus.publish(
        new BillCancelledEvent(input.billId, {
          billId: input.billId,
          enterpriseId: bill.enterpriseId,
          reason: 'Cancelled by user',
        })
      );
    });
  }
}
