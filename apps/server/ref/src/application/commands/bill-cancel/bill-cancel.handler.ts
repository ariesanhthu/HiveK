import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BillCancelCommand } from './bill-cancel.command';
import { CommonValidationService } from '@/application';
import { BillCancelledEvent } from '@/core';
import { BILL_REPOSITORY, type IBillRepository } from '@/core';
import { BillNotFoundException } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { getErrorMessage, getErrorStack, toError } from '@/shared/utils/error.util';

@CommandHandler(BillCancelCommand)
export class BillCancelHandler implements ICommandHandler<BillCancelCommand> {
	constructor(
		private readonly commonValidationService: CommonValidationService,
		@Inject(BILL_REPOSITORY)
		private readonly billRepository: IBillRepository,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		private readonly eventBus: EventBus
	) {
		this.logger.setContext(BillCancelHandler.name);
	}

	async execute(command: BillCancelCommand): Promise<void> {
		const { billId } = command.dto;

		try {
			// 1. Validate & Get Bill
			const bill = await this.commonValidationService.validateBillExists(billId);
			if (!bill) {
				throw new BillNotFoundException(billId);
			}

			// 2. Logic: Cancel
			bill.cancel();

			// 3. Persistence
			await this.billRepository.save(bill);

			// 4. Event
			this.eventBus.publish(
				new BillCancelledEvent(billId, bill.enterpriseId, 'Cancelled by user')
			);
		} catch (error: unknown) {
			this.logger.error(getErrorMessage(error), getErrorStack(error));
			throw toError(error);
		}
	}
}
