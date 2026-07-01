import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WalletTransactionGetByIdQuery } from './wallet-transaction-get-by-id.query';
import { type IWalletTransactionRepository, WALLET_TRANSACTION_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { WalletTransactionResponseDTO } from '../../dtos';
import { WalletTransactionMapper } from '../../mappers';

@QueryHandler(WalletTransactionGetByIdQuery)
export class WalletTransactionGetByIdHandler implements IQueryHandler<WalletTransactionGetByIdQuery> {
	constructor(
		@Inject(WALLET_TRANSACTION_REPOSITORY)
		private readonly transactionRepository: IWalletTransactionRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(query: WalletTransactionGetByIdQuery): Promise<WalletTransactionResponseDTO> {
		const { dto } = query;
		this.loggerService.log(`Fetching wallet transaction with ID: ${dto.id}`);

		const transaction = await this.transactionRepository.findById(dto.id);
		if (!transaction) {
			throw new Error(`Wallet transaction with ID: ${dto.id} not found`);
		}

		this.loggerService.log(`Wallet transaction with ID: ${dto.id} fetched successfully`);
		return WalletTransactionMapper.toDto(transaction);
	}
}
