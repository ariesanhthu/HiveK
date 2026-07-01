import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentEventGetByPaymentIdQuery } from './payment-event-get-by-payment-id.query';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaymentEventMapper } from '@/application/mappers';
import { AuditRepository, type IAuditRepository } from '@/core';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import type { PaymentEventResponseDto } from '@/application/dtos';

@QueryHandler(PaymentEventGetByPaymentIdQuery)
export class PaymentEventGetByPaymentIdHandler implements IQueryHandler<PaymentEventGetByPaymentIdQuery> {
	constructor(
		@Inject(AuditRepository)
		private readonly auditRepository: IAuditRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: PaymentEventGetByPaymentIdQuery
	): Promise<PaginationCursorResponseDto<PaymentEventResponseDto>> {
		const dto = query.dto;
		dto.limit += 1;

		const events = await this.auditRepository.findByPaymentId(dto);
		const hasNextPage = events.length >= dto.limit;
		if (hasNextPage) {
			events.pop();
		}
		return {
			items: PaymentEventMapper.toDtoList(events),
			nextCursor: hasNextPage ? events[events.length - 1].id : null,
		};
	}
}
