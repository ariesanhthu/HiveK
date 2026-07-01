import { Query } from '@nestjs/cqrs';
import { type WalletGetByEnterpriseDto } from './wallet-get-by-enterprise.dto';
import type { WalletResponseDTO } from '@/application/dtos';

export class WalletGetByEnterpriseQuery extends Query<WalletResponseDTO> {
	constructor(public readonly dto: WalletGetByEnterpriseDto) {
		super();
	}
}
