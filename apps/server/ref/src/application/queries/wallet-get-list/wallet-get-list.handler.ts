import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { type IWalletRepository, WALLET_REPOSITORY } from '@/core';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { WalletGetListQuery } from './wallet-get-list.query';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import { WalletMapper } from '../../mappers';
import type { WalletResponseDTO } from '@/application/dtos';

@QueryHandler(WalletGetListQuery)
export class WalletGetListHandler implements IQueryHandler<WalletGetListQuery> {
	constructor(
		@Inject(WALLET_REPOSITORY)
		private readonly walletRepository: IWalletRepository,
		@Inject(LOGGER_SERVICE)
		private readonly loggerService: ILoggerService
	) {}

	async execute(
		query: WalletGetListQuery
	): Promise<PaginationCursorResponseDto<WalletResponseDTO>> {
		const dto = query.dto;
		dto.limit += 1;

		const wallets = await this.walletRepository.findMany(dto);
		const hasNextPage = wallets.length >= dto.limit;
		if (hasNextPage) {
			wallets.pop();
		}

		return {
			items: WalletMapper.toDtoList(wallets),
			nextCursor: hasNextPage ? wallets[wallets.length - 1].id : null,
		};
	}
}
