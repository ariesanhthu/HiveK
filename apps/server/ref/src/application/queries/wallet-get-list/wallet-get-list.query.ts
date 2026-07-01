import { Query } from '@nestjs/cqrs';
import { type WalletGetListDto } from './wallet-get-list.dto';
import type { WalletResponseDTO } from '@/application/dtos';
import type { PaginationCursorResponseDto } from '@/shared/dtos';

export class WalletGetListQuery extends Query<PaginationCursorResponseDto<WalletResponseDTO>> {
	constructor(public readonly dto: WalletGetListDto) {
		super();
	}
}
