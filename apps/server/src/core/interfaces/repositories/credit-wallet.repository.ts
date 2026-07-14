import { IBaseRepository } from '../../common';
import { CreditWalletRoot } from '../../aggregate-roots/credit-wallet.aggregate';
import { Nullable } from '../../types';

export interface ICreditWalletRepository extends IBaseRepository<CreditWalletRoot> {
  findByEnterpriseId(enterpriseId: string): Promise<Nullable<CreditWalletRoot>>;
}

export const CREDIT_WALLET_REPOSITORY = Symbol('ICreditWalletRepository');
