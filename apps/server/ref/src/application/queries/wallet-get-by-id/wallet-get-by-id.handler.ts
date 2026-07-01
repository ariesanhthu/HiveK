import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WalletGetByIdQuery } from './wallet-get-by-id.query';
import { type IWalletRepository, WALLET_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { WalletResponseDTO } from '../../dtos';
import { WalletMapper } from '../../mappers';

@QueryHandler(WalletGetByIdQuery)
export class WalletGetByIdHandler implements IQueryHandler<WalletGetByIdQuery> {
	constructor(
		@Inject(WALLET_REPOSITORY)
		private readonly walletRepository: IWalletRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: WalletGetByIdQuery): Promise<WalletResponseDTO> {
		const { dto } = query;
		this.loggerService.log(`Fetching wallet with ID: ${dto.id}`);

		const wallet = await this.walletRepository.findById(dto.id);
		if (!wallet) {
			this.loggerService.log(
				`Wallet with ID: ${dto.id} not found (feature disabled). Returning dummy wallet.`
			);
			return {
				id: dto.id,
				enterpriseId: 'disabled-enterprise',
				balanceAmount: 0,
				balanceCurrency: 'VND',
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			/*
			throw new Error(`Wallet with ID: ${dto.id} not found`);
			*/
		}

		this.loggerService.log(`Wallet with ID: ${dto.id} fetched successfully`);
		return WalletMapper.toDto(wallet);
	}
}
