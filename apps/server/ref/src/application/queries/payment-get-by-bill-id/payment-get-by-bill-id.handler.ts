import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentGetByBillIdQuery } from './payment-get-by-bill-id.query';
import type { PaymentResponseDto } from '@/application/dtos/payment.response.dto';
import { PaymentMapper } from '@/application/mappers/payment.mapper';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '@/core';

import { PaymentNotFoundForBillException } from '@/core';

@QueryHandler(PaymentGetByBillIdQuery)
export class PaymentGetByBillIdHandler implements IQueryHandler<PaymentGetByBillIdQuery> {
	constructor(
		@Inject(PAYMENT_REPOSITORY)
		private readonly paymentRepository: IPaymentRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: PaymentGetByBillIdQuery): Promise<PaymentResponseDto> {
		const { billId } = query.dto;
		const payment = await this.paymentRepository.findById(billId);
		if (!payment) {
			throw new PaymentNotFoundForBillException(billId);
		}
		return PaymentMapper.toDto(payment);
	}
}
