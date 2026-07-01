import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentProviderDeleteCommand } from './payment-provider-delete.command';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/core/interfaces';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaymentProviderNotFoundException } from '@/core';
import { PaymentProviderDeleteResponseDto } from './payment-provider-delete.dto';
import { toError } from '@/shared/utils/error.util';

@CommandHandler(PaymentProviderDeleteCommand)
export class PaymentProviderDeleteHandler implements ICommandHandler<
	PaymentProviderDeleteCommand,
	PaymentProviderDeleteResponseDto
> {
	constructor(
		@Inject(UNIT_OF_WORK)
		private readonly uow: IUnitOfWork,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		command: PaymentProviderDeleteCommand
	): Promise<PaymentProviderDeleteResponseDto> {
		const { dto } = command;
		const session = await this.uow.start();

		try {
			const provider = await session.providerRepository.findById(dto.id);
			if (!provider) {
				throw new PaymentProviderNotFoundException(dto.id);
			}

			// Soft delete: set deletedAt and deletedBy
			provider.maskAsDeleted(dto.deletedBy);

			await session.providerRepository.save(provider);
			await session.commit();

			this.loggerService.log(`Deleted provider ${dto.id} by ${dto.deletedBy}`);
			return { success: true };
		} catch (error) {
			await session.rollback();
			throw toError(error);
		} finally {
			await session.end();
		}
	}
}
