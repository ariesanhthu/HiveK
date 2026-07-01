import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderGetByIdQuery } from './payment-provider-get-by-id.query';
import { PaymentProviderResponseDto } from '@/application';
import { PaymentProviderMapper } from '@/application/mappers';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core';
import { PaymentProviderNotFoundException } from '@/core';

@QueryHandler(PaymentProviderGetByIdQuery)
export class PaymentProviderGetByIdHandler implements IQueryHandler<PaymentProviderGetByIdQuery> {
	constructor(
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly PAYMENT_PROVIDER_REPOSITORY: IPaymentProviderRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: PaymentProviderGetByIdQuery): Promise<PaymentProviderResponseDto> {
		const { id } = query.dto;
		const provider = await this.PAYMENT_PROVIDER_REPOSITORY.findById(id);
		if (!provider) {
			throw new PaymentProviderNotFoundException(id);
		}
		return PaymentProviderMapper.toDto(provider);
	}
}
