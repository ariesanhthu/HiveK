import { IBaseRepository } from '../../common';
import { PaymentProviderEntity } from '../../entities/payment-provider.entity';

export interface IPaymentProviderRepository extends IBaseRepository<PaymentProviderEntity> {
  findByCode(code: string): Promise<PaymentProviderEntity | null>;
  findAllActive(): Promise<PaymentProviderEntity[]>;
}

export const PAYMENT_PROVIDER_REPOSITORY = Symbol('IPaymentProviderRepository');
