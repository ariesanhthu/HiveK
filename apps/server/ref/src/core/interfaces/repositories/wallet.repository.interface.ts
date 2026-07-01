import { type IRepository } from '@/core/interfaces';
import { type WalletEntity } from '@/core/aggregate-roots';

export const WALLET_REPOSITORY = Symbol('WALLET_REPOSITORY');

export interface IWalletRepository extends IRepository<WalletEntity> {
	findByEnterpriseId(enterpriseId: string): Promise<WalletEntity | null>;
}
