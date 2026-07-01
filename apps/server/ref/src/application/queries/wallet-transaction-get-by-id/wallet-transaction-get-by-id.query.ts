import { Query } from '@nestjs/cqrs';
import { type WalletTransactionGetByIdDto } from './wallet-transaction-get-by-id.dto';
import type { WalletTransactionResponseDTO } from '@/application/dtos';

export class WalletTransactionGetByIdQuery extends Query<WalletTransactionResponseDTO> {
	constructor(public readonly dto: WalletTransactionGetByIdDto) {
		super();
	}
}
