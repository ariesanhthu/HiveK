import { type WalletTransactionEntity } from '@/core';
import { type WalletTransactionResponseDTO } from '../dtos';

export class WalletTransactionMapper {
	/**
	 * Map WalletTransactionEntity to WalletTransactionResponseDTO (flatten Money object)
	 */
	static toDto(entity: WalletTransactionEntity): WalletTransactionResponseDTO {
		return {
			id: entity.id,
			walletId: entity.walletId,
			type: entity.type,
			amountValue: entity.amount.amount,
			amountCurrency: entity.amount.currency,
			billId: entity.billId ?? undefined,
			idempotencyKey: entity.idempotencyKey,
			description: entity.description,
			metadata: entity.metadata ?? undefined,
			createdAt: entity.createdAt,
		};
	}

	/**
	 * Map array of WalletTransactionEntity to WalletTransactionResponseDTO[]
	 */
	static toDtoList(entities: WalletTransactionEntity[]): WalletTransactionResponseDTO[] {
		return entities.map((entity) => this.toDto(entity));
	}
}
