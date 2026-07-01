import { type WalletEntity } from '@/core';
import { type WalletResponseDTO } from '../dtos';

export class WalletMapper {
	/**
	 * Map WalletEntity to WalletResponseDTO (flatten Money object)
	 */
	static toDto(entity: WalletEntity): WalletResponseDTO {
		return {
			id: entity.id,
			enterpriseId: entity.enterpriseId,
			balanceAmount: entity.balance.amount,
			balanceCurrency: entity.balance.currency,
			createdAt: entity.createdAt,
			updatedAt: entity.updatedAt,
		};
	}

	/**
	 * Map array of WalletEntity to WalletResponseDTO[]
	 */
	static toDtoList(entities: WalletEntity[]): WalletResponseDTO[] {
		return entities.map((entity) => this.toDto(entity));
	}
}
