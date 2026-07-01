import { Query } from '@nestjs/cqrs';
import { type WalletGetListTransactionDto } from './wallet-get-list-transaction.dto';
import type { WalletTransactionResponseDTO } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class WalletGetListTransactionQuery extends Query<
	PaginationCursorResponseDto<WalletTransactionResponseDTO>
> {
	constructor(public readonly dto: WalletGetListTransactionDto) {
		super();
	}
}
