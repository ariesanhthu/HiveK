import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SubscriptionCreateDevCommand } from './subscription-create-dev.command';
import {
	ECurrency,
	PaymentTransactionEntity,
	EPaymentTransactionType,
	ETransactionSource,
	ETransactionStatus,
	EPaymentStatus,
	OutboxEntity,
	EVENT_SERVICE,
	type IEventService,
} from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { BillCreateCommand } from '../bill-create/bill-create.command';
import { PaymentCreateCommand } from '../payment-create/payment-create.command';
import { type BillResponseDto } from '@/application/dtos';
import { type PaymentCreateResponseDto } from '../payment-create/payment-create.dto';
import { getErrorMessage, toError } from '@/shared/utils/error.util';
import { PaymentService } from '@/application/services';
import { UpdateSubscriptionEvent } from '@/application/events';

@CommandHandler(SubscriptionCreateDevCommand)
export class SubscriptionCreateDevHandler implements ICommandHandler<SubscriptionCreateDevCommand> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService,
		private readonly commandBus: CommandBus,
		private readonly paymentService: PaymentService,
		@Inject(EVENT_SERVICE)
		private readonly eventService: IEventService
	) {
		this.logger.setContext(SubscriptionCreateDevHandler.name);
	}

	async execute(command: SubscriptionCreateDevCommand): Promise<void> {
		this.logger.log(
			`Executing SubscriptionCreateDevCommand for enterprise: ${command.dto.enterpriseId}`
		);

		// 1. Create bill (call command BillCreate)
		const bill = await this.commandBus.execute<BillCreateCommand, BillResponseDto>(
			new BillCreateCommand(command.dto)
		);
		this.logger.log(`Bill created successfully: ${bill.id}`);

		// Find active payment provider using repository from unit of work session
		const session = await this.uow.start();
		let paymentProviderId: string;
		try {
			const activeProviders = await session.providerRepository.findMany({});
			if (!activeProviders.length) {
				throw new Error('No active payment providers found');
			}
			paymentProviderId = activeProviders[0].id;
		} finally {
			await session.end();
		}

		// 2. Create payment (call command)
		const paymentResult = await this.commandBus.execute<
			PaymentCreateCommand,
			PaymentCreateResponseDto
		>(
			new PaymentCreateCommand({
				enterpriseId: bill.enterpriseId,
				billId: bill.id,
				amount: bill.finalAmount,
				currency: bill.currency as ECurrency,
				description: 'Dev Subscription Payment',
				idempotencyKey: `dev-sub-${bill.id}-${Date.now()}`,
				paymentProviderId,
				createdBy: 'dev',
			})
		);
		this.logger.log(`Payment created successfully: ${paymentResult.paymentId}`);

		// 3. Manually update payment to successfully (do not call command because there is constraint inside)
		const updateSession = await this.uow.start();
		try {
			const payment = await updateSession.paymentRepository.findById(paymentResult.paymentId);
			if (!payment) {
				throw new Error(`Payment with ID ${paymentResult.paymentId} not found`);
			}
			payment.updateStatus(EPaymentStatus.PROCESSING);

			const attempt = payment.getAttemptById(paymentResult.attemptId);
			if (!attempt) {
				throw new Error(`Payment attempt with ID ${paymentResult.attemptId} not found`);
			}

			// Webhook simulation to transition attempt from INITIATED to PROCESSING
			attempt.receiveWebhook();

			// Record CAPTURE transaction using fromProvider factory method to handle optional properties correctly
			const transaction = PaymentTransactionEntity.fromProvider({
				transactionType: EPaymentTransactionType.CAPTURE,
				transactionSource: ETransactionSource.API,
				status: ETransactionStatus.SUCCESS,
				amount: payment.amount,
				description: 'Dev manual confirmation',
				providerTransactionId: `DEV-TX-${Date.now()}`,
			});

			this.paymentService.processTransaction(payment, paymentResult.attemptId, transaction);

			await updateSession.paymentRepository.save(payment);

			const foundBill = await updateSession.billRepository.findById(bill.id || '');
			if (!foundBill) {
				throw new Error(`Bill with ID ${bill.id} not found`);
			}
			foundBill.markAsPaid();
			await updateSession.billRepository.save(foundBill);

			await this.eventService.publishEvents(payment, updateSession);
			// 4. Save PaymentCompletedEvent to the outbox so it triggers the subscription update workflow durably
			// const event = new UpdateSubscriptionEvent({
			// 	paymentId: paymentResult.paymentId,
			// 	billId: bill.id,
			// 	attemptId: paymentResult.attemptId,
			// 	amount: bill.finalAmount,
			// 	currency: bill.currency,
			// })
			// await updateSession.outboxRepository.create(
			// 	OutboxEntity.create(event)
			// );

			await updateSession.commit();
			this.logger.log(`Payment status updated manually to completed: ${payment.id}`);
		} catch (error: unknown) {
			this.logger.error(`Failed to manually update payment: ${getErrorMessage(error)}`);
			await updateSession.rollback();
			throw toError(error);
		} finally {
			await updateSession.end();
		}
	}
}
