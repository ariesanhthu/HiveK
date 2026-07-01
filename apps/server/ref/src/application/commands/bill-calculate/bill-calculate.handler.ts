import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { getErrorMessage, getErrorStack, toError } from '@/shared/utils/error.util';
import { BillCalculateCommand } from './bill-calculate.command';
import { BillCalculateResponseDto } from './bill-calculate.response.dto';
import { BillMapper } from '@/application/mappers';
import { BillService } from '@/application';
import { CommonValidationService } from '@/application';
import { BillEntity } from '@/core';
import { EBillType, EBillStatus } from '@/core';
import { EPackageType } from '@/core';
import { BillMultiplePlanException } from '@/core';

import { ECurrency } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { Inject } from '@nestjs/common';

@CommandHandler(BillCalculateCommand)
export class BillCalculateHandler implements ICommandHandler<BillCalculateCommand> {
	constructor(
		private readonly billService: BillService,
		private readonly commonValidationService: CommonValidationService,
		@Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService
	) {
		this.logger.setContext(BillCalculateHandler.name);
	}

	async execute(command: BillCalculateCommand): Promise<BillCalculateResponseDto> {
		const { enterpriseId, items: requestItems } = command.dto;

		try {
			// 1. Validation: Versions & Variants Exist
			const validatedItems =
				await this.commonValidationService.validatePackageItems(requestItems);

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
				validatedItems
			);

			// Set currency from first item
			const billCurrency = validatedItems[0]?.variant.currency || ECurrency.VND;

			// 4. Credit Estimation (based on current/old subscription)
			const creditAmountApplied = await this.estimateCredit(enterpriseId);
			// 5. Create Entity (Ephemeral)
			const bill = BillEntity.create({
				billCode: 'PREVIEW',
				enterpriseId: '',
				type: EBillType.PURCHASE,
				status: EBillStatus.PENDING,
				items,
				totalAmount: undefined,
				taxAmount: undefined,
				finalAmount: undefined,
				creditAmountApplied,
				creditAmountRefund: undefined,
				currency: billCurrency,
				createdAt: new Date(),
				expiresAt: null,
			});

			// 6. Return mapped DTO (No persistence, No events)
			return BillMapper.toCalculateDto(bill);
		} catch (error: unknown) {
			this.logger.error(getErrorMessage(error), getErrorStack(error));
			throw toError(error);
		}
	}

	private async estimateCredit(enterpriseId: string | undefined): Promise<number> {
		this.logger.log(`Credit estimation disabled. Returning 0 for enterprise: ${enterpriseId}`);
		return 0;
		/*
		if (!enterpriseId) {
			return 0;
		}

		try {
			const session = await this.uow.start();
			try {
				// 1. Fetch current subscription (old/existing packages)
				const subscription =
					await session.subscriptionRepository.findByEnterpriseId(enterpriseId);
				if (!subscription) {
					this.logger.log(
						`No current subscription found for enterprise: ${enterpriseId}`
					);
					return 0;
				}

				if (subscription.items.length === 0) {
					this.logger.log(
						`Current subscription has no items for enterprise: ${enterpriseId}`
					);
					return 0;
				}

				// 2. Find the PLAN package in the current subscription
				// Fetch all packages from current subscription items
				const packageIds = subscription.items.map((item) => item.packageId);
				const packages = await session.packageRepository.findByIds(packageIds);

				// Find which subscription item belongs to a PLAN package
				let planSubscriptionItem: import('@/core/value-objects').SubscriptionItemVO | null = null;
				let planPackage: import('@/core/aggregate-roots').PackageEntity | null = null;
				let planVariant: import('@/core/entities').PackageVariantEntity | null = null;

				for (let i = 0; i < packages.length; i++) {
					const pkg = packages[i];
					if (!pkg) continue;

					if (pkg.type === EPackageType.PLAN) {
						planSubscriptionItem = subscription.items[i];
						planPackage = pkg;
						planVariant = planPackage.variants.find(
							(v) => v.id === planSubscriptionItem.packageVariantId
						);
						break;
					}
				}

				if (!planSubscriptionItem || !planVariant) {
					this.logger.log(
						`No PLAN package found in current subscription for enterprise: ${enterpriseId}`
					);
					return 0;
				}

				// 3. Calculate remaining days on the old plan
				const now = new Date();
				const expiresAt = new Date(planSubscriptionItem.expiresAt);
				const remainingMilliseconds = expiresAt.getTime() - now.getTime();

				if (remainingMilliseconds <= 0) {
					this.logger.log(
						`Current PLAN package already expired for enterprise: ${enterpriseId}`
					);
					return 0;
				}

				const remainingDays = remainingMilliseconds / (1000 * 60 * 60 * 24);
				const totalDays = planVariant.durationMonths * 30; // Approximate: 30 days per month

				// 4. Calculate credit for remaining days
				// Use priceAfterDiscount from the old plan variant
				const refundCredit = (remainingDays / totalDays) * planVariant.priceAfterDiscount;

				this.logger.log(
					`Estimated credit for enterprise ${enterpriseId}: ${refundCredit.toFixed(2)} ` +
						`(remaining: ${remainingDays.toFixed(1)} days, duration: ${totalDays} days, price: ${planVariant.priceAfterDiscount})`
				);

				return Math.round(refundCredit * 100) / 100; // Round to 2 decimal places
			} finally {
				await session.end();
			}
		} catch (error: unknown) {
			this.logger.error(
				`Error estimating credit for enterprise ${enterpriseId}: ${getErrorMessage(error)}`,
				getErrorStack(error)
			);
			return 0;
		}
		*/
	}
}
