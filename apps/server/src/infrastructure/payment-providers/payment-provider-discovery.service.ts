import { Inject, Injectable, Optional } from '@nestjs/common';
import { IPaymentProvider, IPaymentProviderDiscovery, PAYMENT_PROVIDERS } from '@/core/interfaces';

@Injectable()
export class PaymentProviderDiscoveryService implements IPaymentProviderDiscovery {
  constructor(
    @Optional()
    @Inject(PAYMENT_PROVIDERS)
    private readonly providers: Record<string, IPaymentProvider> = {},
  ) {}

  findProvider(code?: string): IPaymentProvider | null {
    if (!code) return null;
    return this.providers[code.toLowerCase()] || null;
  }
}
