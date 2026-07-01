import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentEventGetByIdQuery } from './payment-event-get-by-id.query';

import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import type { PaymentEventResponseDto } from '@/application/dtos';
import { PaymentEventMapper } from '@/application/mappers';
import { AuditRepository, type IAuditRepository } from '@/core';

@QueryHandler(PaymentEventGetByIdQuery)
export class PaymentEventGetByIdHandler implements IQueryHandler<PaymentEventGetByIdQuery> {
	constructor(
		@Inject(AuditRepository) // Assuming AUDIT_REPOSITORY is a constant or alias for AuditRepository, or AuditRepository should remain. Sticking to the original import name for the class.
		private readonly auditRepository: IAuditRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: PaymentEventGetByIdQuery): Promise<PaymentEventResponseDto> {
		const { id } = query.dto;
		const event = await this.auditRepository.findById(id);
		if (!event) {
			throw new Error('Payment Event not found');
		}
		return PaymentEventMapper.toDto(event);
	}
}
