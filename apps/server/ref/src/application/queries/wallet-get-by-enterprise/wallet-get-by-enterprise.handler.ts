import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WalletGetByEnterpriseQuery } from './wallet-get-by-enterprise.query';
import { type IWalletRepository, WALLET_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { WalletResponseDTO } from '../../dtos';
import { WalletMapper } from '../../mappers';

@QueryHandler(WalletGetByEnterpriseQuery)
export class WalletGetByEnterpriseHandler implements IQueryHandler<WalletGetByEnterpriseQuery> {
	constructor(
		@Inject(WALLET_REPOSITORY)
		private readonly walletRepository: IWalletRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: WalletGetByEnterpriseQuery): Promise<WalletResponseDTO> {
		const { dto } = query;
		this.loggerService.log(`Fetching wallet for enterprise: ${dto.enterpriseId}`);

		const wallet = await this.walletRepository.findByEnterpriseId(dto.enterpriseId);
		if (!wallet) {
			this.loggerService.log(
				`Wallet for enterprise ${dto.enterpriseId} not found (feature disabled). Returning dummy wallet.`
			);
			return {
				id: 'disabled-wallet',
				enterpriseId: dto.enterpriseId,
				balanceAmount: 0,
				balanceCurrency: 'VND',
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			/*
			throw new Error(`Wallet for enterprise ${dto.enterpriseId} not found`);
			*/
		}

		this.loggerService.log(`Wallet for enterprise ${dto.enterpriseId} fetched successfully`);
		return WalletMapper.toDto(wallet);
	}
}
