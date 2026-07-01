import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentGetListQuery } from './payment-get-list.query';
import { PaymentMapper } from '@/application/mappers/payment.mapper';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PAYMENT_REPOSITORY, type IPaymentRepository } from '@/core';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import type { PaymentResponseDto } from '@/application/dtos/payment.response.dto';

@QueryHandler(PaymentGetListQuery)
export class PaymentGetListHandler implements IQueryHandler<PaymentGetListQuery> {
	constructor(
		@Inject(PAYMENT_REPOSITORY)
		private readonly paymentRepository: IPaymentRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: PaymentGetListQuery
	): Promise<PaginationCursorResponseDto<PaymentResponseDto>> {
		const dto = query.dto;
		dto.limit += 1;

		const payments = await this.paymentRepository.findMany(dto);
		const hasNextPage = payments.length >= dto.limit;
		if (hasNextPage) {
			payments.pop();
		}
		return {
			items: PaymentMapper.toDtoList(payments),
			nextCursor: hasNextPage ? payments[payments.length - 1].id : null,
		};
	}
}
