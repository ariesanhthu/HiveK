import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import {
  PAYMENT_PROVIDERS,
  PAYMENT_PROVIDER_DISCOVERY,
} from '@/core/interfaces';
import { PaymentProviderDiscoveryService } from './payment-provider-discovery.service';
import { MomoService } from './momo/momo.service';

@Module({
  imports: [HttpModule],
  providers: [
    MomoService,
    {
      provide: PAYMENT_PROVIDERS,
      inject: [MomoService],
      useFactory: (momo: MomoService) => ({
        momo: momo,
      }),
    },
    {
      provide: PAYMENT_PROVIDER_DISCOVERY,
      useClass: PaymentProviderDiscoveryService,
    },
  ],
  exports: [PAYMENT_PROVIDER_DISCOVERY],
})
export class PaymentProvidersModule {}
