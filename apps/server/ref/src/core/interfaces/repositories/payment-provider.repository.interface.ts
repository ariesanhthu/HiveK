import { type IRepository } from '@/core/interfaces';
import { type PaymentProviderEntity } from '@/core/entities';

export const PAYMENT_PROVIDER_REPOSITORY = Symbol('PAYMENT_PROVIDER_REPOSITORY');

export interface IPaymentProviderRepository extends IRepository<PaymentProviderEntity> {
	findByCode(code: string): Promise<PaymentProviderEntity | null>;
	findAllActive(): Promise<PaymentProviderEntity[]>;
}
