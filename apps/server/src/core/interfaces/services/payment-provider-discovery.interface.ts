import { IPaymentProvider } from './payment-provider.interface';

export interface IPaymentProviderDiscovery {
  findProvider(code?: string): IPaymentProvider | null;
}

export const PAYMENT_PROVIDER_DISCOVERY = Symbol('PAYMENT_PROVIDER_DISCOVERY');
