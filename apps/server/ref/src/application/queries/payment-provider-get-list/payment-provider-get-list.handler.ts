import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderGetListQuery } from './payment-provider-get-list.query';
import { PaymentProviderMapper } from '@/application/mappers/payment-provider.mapper';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PAYMENT_PROVIDER_REPOSITORY, type IPaymentProviderRepository } from '@/core';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import type { PaymentProviderResponseDto } from '@/application/dtos';

@QueryHandler(PaymentProviderGetListQuery)
export class PaymentProviderGetListHandler implements IQueryHandler<PaymentProviderGetListQuery> {
	constructor(
		@Inject(PAYMENT_PROVIDER_REPOSITORY)
		private readonly providerRepository: IPaymentProviderRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: PaymentProviderGetListQuery
	): Promise<PaginationCursorResponseDto<PaymentProviderResponseDto>> {
		const dto = query.dto;
		dto.limit += 2;

		const providers = await this.providerRepository.findMany(dto);
		console.log(providers.length);
		const hasNextPage = providers.length >= dto.limit;
		if (hasNextPage) {
			providers.pop();
		}
		return {
			items: PaymentProviderMapper.toDtoList(providers),
			nextCursor: hasNextPage ? providers[providers.length - 1].id : null,
		};
	}
}
