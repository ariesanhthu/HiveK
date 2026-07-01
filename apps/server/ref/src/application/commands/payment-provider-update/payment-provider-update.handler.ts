import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderUpdateCommand } from './payment-provider-update.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaymentProviderNotFoundException, InvalidProviderCredentialsException } from '@/core';
import { PAYMENT_PROVIDER_DISCOVERY, type IPaymentProviderDiscovery } from '@/core';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaymentProviderMapper } from '@/application/mappers';
import { toError } from '@/shared/utils/error.util';

@CommandHandler(PaymentProviderUpdateCommand)
export class PaymentProviderUpdateHandler implements ICommandHandler<
	PaymentProviderUpdateCommand,
	PaymentProviderResponseDto
> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService,
		@Inject(PAYMENT_PROVIDER_DISCOVERY)
		private readonly providerDiscovery: IPaymentProviderDiscovery
	) {}

	async execute(command: PaymentProviderUpdateCommand): Promise<PaymentProviderResponseDto> {
		const { dto } = command;
		const session = await this.uow.start();

		try {
			const provider = await session.providerRepository.findById(dto.id);
			if (!provider) {
				throw new PaymentProviderNotFoundException(dto.id);
			}

			this.loggerService.log(`Updating provider ${dto.id} by ${dto.updatedBy}`);

			if (dto.displayName !== undefined) provider.displayName = dto.displayName;
			if (dto.supportedMethods !== undefined)
				provider.supportedMethods = dto.supportedMethods;
			if (dto.supportedCurrencies !== undefined)
				provider.supportedCurrencies = dto.supportedCurrencies;
			if (dto.credentials !== undefined) {
				const providerImplementation = this.providerDiscovery.findProvider(provider.code);
				if (providerImplementation) {
					const isValid = providerImplementation.checkCredentialFields(
						dto.credentials || {}
					);
					if (!isValid) {
						throw new InvalidProviderCredentialsException(provider.code);
					}
				}
				provider.credentials = dto.credentials;
			}
			if (dto.isActive !== undefined) provider.isActive = dto.isActive;
			if (dto.supportsWebhook !== undefined) provider.supportsWebhook = dto.supportsWebhook;
			if (dto.supportsRefund !== undefined) provider.supportsRefund = dto.supportsRefund;
			if (dto.supportsPartialRefund !== undefined)
				provider.supportsPartialRefund = dto.supportsPartialRefund;
			if (dto.baseUrl !== undefined) provider.baseUrl = dto.baseUrl;
			if (dto.testUrl !== undefined) provider.testUrl = dto.testUrl;
			if (dto.webhookUrl !== undefined) provider.webhookUrl = dto.webhookUrl;

			provider.updatedAt = new Date();

			await session.providerRepository.save(provider);
			await session.commit();
			return PaymentProviderMapper.toDto(provider);
		} catch (error) {
			await session.rollback();
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
