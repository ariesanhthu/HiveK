import { Query } from '@nestjs/cqrs';
import { type WalletGetByIdDto } from './wallet-get-by-id.dto';
import type { WalletResponseDTO } from '@/application/dtos';

export class WalletGetByIdQuery extends Query<WalletResponseDTO> {
	constructor(public readonly dto: WalletGetByIdDto) {
		super();
	}
}
