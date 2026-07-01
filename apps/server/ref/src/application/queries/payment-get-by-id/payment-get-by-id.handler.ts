import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentGetByIdQuery } from './payment-get-by-id.query';
import type { PaymentDetailResponseDto } from '@/application/dtos/payment.response.dto';
import { PaymentMapper } from '@/application/mappers/payment.mapper';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '@/core';

import { PaymentNotFoundException } from '@/core';

@QueryHandler(PaymentGetByIdQuery)
export class PaymentGetByIdHandler implements IQueryHandler<PaymentGetByIdQuery> {
	constructor(
		@Inject(PAYMENT_REPOSITORY)
		private readonly paymentRepository: IPaymentRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: PaymentGetByIdQuery): Promise<PaymentDetailResponseDto> {
		const { id } = query.dto;
		const payment = await this.paymentRepository.findById(id);
		if (!payment) {
			throw new PaymentNotFoundException(id);
		}
		return PaymentMapper.toDtoDetail(payment);
	}
}
