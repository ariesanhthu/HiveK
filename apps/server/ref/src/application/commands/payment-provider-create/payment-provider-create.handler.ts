import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderCreateCommand } from './payment-provider-create.command';
import { PaymentProviderEntity } from '@/core';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaymentProviderAlreadyExistsException, InvalidProviderCredentialsException } from '@/core';
import { PAYMENT_PROVIDER_DISCOVERY, type IPaymentProviderDiscovery } from '@/core';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaymentProviderMapper } from '@/application/mappers';
import { toError } from '@/shared/utils/error.util';

@CommandHandler(PaymentProviderCreateCommand)
export class PaymentProviderCreateHandler implements ICommandHandler<
	PaymentProviderCreateCommand,
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

	async execute(command: PaymentProviderCreateCommand): Promise<PaymentProviderResponseDto> {
		const { dto } = command;
		const session = await this.uow.start();

		try {
			const existingProvider = await session.providerRepository.findByCode(dto.code);
			if (existingProvider) {
				throw new PaymentProviderAlreadyExistsException(dto.code);
			}

			const providerImplementation = this.providerDiscovery.findProvider(dto.code);
			if (providerImplementation) {
				const isValid = providerImplementation.checkCredentialFields(dto.credentials || {});
				if (!isValid) {
					throw new InvalidProviderCredentialsException(dto.code);
				}
			}

			const entity = PaymentProviderEntity.create({
				code: dto.code,
				displayName: dto.displayName,
				supportedMethods: dto.supportedMethods,
				supportedCurrencies: dto.supportedCurrencies,
				credentials: dto.credentials,

				isActive: dto.isActive,
				supportsWebhook: dto.supportsWebhook,
				supportsRefund: dto.supportsRefund,
				supportsPartialRefund: dto.supportsPartialRefund,
				baseUrl: dto.baseUrl,
				testUrl: dto.testUrl,
				webhookUrl: dto.webhookUrl,
				createdAt: new Date(),
				updatedAt: new Date(),
				deletedAt: undefined,
				deletedBy: undefined,
			});

			const result = await session.providerRepository.create(entity);
			await session.commit();
			return PaymentProviderMapper.toDto(result);
		} catch (error) {
			await session.rollback();
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
