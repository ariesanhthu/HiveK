import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BillCreateCommand } from './bill-create.command';
import { BillResponseDto } from '@/application/dtos';
import { BillMapper } from '@/application/mappers';
import { BillService } from '@/application';
import { CommonValidationService } from '@/application';
import { BillCreatedEvent } from '@/core';
import { BillEntity } from '@/core';
import { EBillType, EBillStatus } from '@/core';
import { EPackageType } from '@/core';
import { BillMultiplePlanException } from '@/core';

import { ECurrency } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { getErrorMessage, getErrorStack, toError } from '@/shared/utils/error.util';

@CommandHandler(BillCreateCommand)
export class BillCreateHandler implements ICommandHandler<BillCreateCommand> {
	constructor(
		private readonly billService: BillService,
		private readonly commonValidationService: CommonValidationService,
		@Inject(UNIT_OF_WORK)
		private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		private readonly eventBus: EventBus
	) {
		this.logger.setContext(BillCreateHandler.name);
	}

	async execute(command: BillCreateCommand): Promise<BillResponseDto> {
		const { enterpriseId, items: requestItems } = command.dto;
		const session = await this.uow.start();

		try {
			// 1. Validation: Versions & Variants Exist
			const validatedItems = await this.commonValidationService.validatePackageItems(
				requestItems,
				session
			);

			// 2. Business Rules: Max 1 PLAN Package
			let planCount = 0;
			validatedItems.forEach((item) => {
				if (item.pkg.type === EPackageType.PLAN) {
					planCount++;
				}
			});

			if (planCount > 1) {
				throw new BillMultiplePlanException();
			}

			// 3. Logic: Determine purchase types by comparing with current subscription
			const items = await this.billService.determinePurchaseTypes(
				enterpriseId,
				validatedItems,
				session
			);

			// Set currency from first item
			const billCurrency = validatedItems[0]?.variant.currency || ECurrency.VND;

			// 4. Credit Estimation
			const creditAmountApplied = this.estimateCredit(enterpriseId);

			// 5. Create Entity
			const bill = BillEntity.create({
				billCode: this.generateBillCode(),
				enterpriseId,
				type: EBillType.PURCHASE,
				status: EBillStatus.PENDING,
				items,
				creditAmountApplied,
				creditAmountRefund: undefined,
				currency: billCurrency,
				createdAt: new Date(),
				expiresAt: null,
			});

			// 6. Persistence
			const newBill = await session.billRepository.create(bill);
			await session.commit();

			// 7. Event
			this.eventBus.publish(new BillCreatedEvent(newBill));

			// 8. Return
			return BillMapper.toDto(newBill);
		} catch (error: unknown) {
			this.logger.error(getErrorMessage(error), getErrorStack(error));
			await session.rollback();
			throw toError(error);
		} finally {
			await session.end();
		}
	}

	private estimateCredit(_enterpriseId: string): number {
		// Temporary: return 0
		return 0;
	}

	private generateBillCode(): string {
		// Temporary simple generation
		return `BILL-${Date.now()}`;
	}
}
