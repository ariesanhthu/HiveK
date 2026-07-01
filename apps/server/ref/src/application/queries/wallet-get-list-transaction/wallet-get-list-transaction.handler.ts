import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { WalletGetListTransactionQuery } from './wallet-get-list-transaction.query';
import { type IWalletRepository, WALLET_REPOSITORY } from '@/core';
import { type IWalletTransactionRepository, WALLET_TRANSACTION_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import { WalletTransactionMapper } from '../../mappers';
import type { WalletTransactionResponseDTO } from '@/application/dtos';
import type { WalletTransactionEntity } from '@/core';

@QueryHandler(WalletGetListTransactionQuery)
export class WalletGetListTransactionHandler implements IQueryHandler<WalletGetListTransactionQuery> {
	constructor(
		@Inject(WALLET_REPOSITORY)
		private readonly walletRepository: IWalletRepository,
		@Inject(WALLET_TRANSACTION_REPOSITORY)
		private readonly transactionRepository: IWalletTransactionRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: WalletGetListTransactionQuery
	): Promise<PaginationCursorResponseDto<WalletTransactionResponseDTO>> {
		const dto = query.dto;
		dto.limit += 1;

		let transactions: WalletTransactionEntity[];
		if (dto.enterpriseId) {
			// If enterprise_id is provided, filter by wallet
			const wallet = await this.walletRepository.findByEnterpriseId(dto.enterpriseId);
			if (!wallet) {
				return {
					items: [],
					nextCursor: null,
				};
			}
			// For now, use findByWalletId since we need to filter by wallet
			// TODO: Add wallet_id to the DTO filter or make enterpriseId resolve to wallet_id
			transactions = await this.transactionRepository.findByWalletId(wallet.id);
			// Apply cursor and limit manually
			if (dto.cursor) {
				const cursorIndex = transactions.findIndex((tx) => tx.id === dto.cursor);
				if (cursorIndex >= 0) {
					transactions = transactions.slice(cursorIndex + 1);
				}
			}
			transactions = transactions.slice(0, dto.limit);
		} else {
			// No filter, get all transactions
			transactions = await this.transactionRepository.findMany(dto);
		}

		const hasNextPage = transactions.length >= dto.limit;
		if (hasNextPage) {
			transactions.pop();
		}

		return {
			items: WalletTransactionMapper.toDtoList(transactions),
			nextCursor: hasNextPage ? transactions[transactions.length - 1].id : null,
		};
	}
}
