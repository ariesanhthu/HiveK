import { type IRepository } from '@/core/interfaces';
import { type WalletTransactionEntity } from '@/core/entities';

export const WALLET_TRANSACTION_REPOSITORY = Symbol('WALLET_TRANSACTION_REPOSITORY');

export interface IWalletTransactionRepository extends IRepository<WalletTransactionEntity> {
	findByWalletId(walletId: string): Promise<WalletTransactionEntity[]>;
	findByBillId(billId: string): Promise<WalletTransactionEntity[]>;
	findByIdempotencyKey(idempotencyKey: string): Promise<WalletTransactionEntity | null>;
}
