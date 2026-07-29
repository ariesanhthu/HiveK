import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  PAYMENT_PROVIDER_READ_SERVICE,
  type IPaymentProviderReadService,
} from '@/application/interfaces';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaymentProviderGetByIdQuery } from './payment-provider-get-by-id.query';

@QueryHandler(PaymentProviderGetByIdQuery)
export class PaymentProviderGetByIdHandler implements IQueryHandler<
  PaymentProviderGetByIdQuery,
  PaymentProviderResponseDto | null
> {
  constructor(
    @Inject(PAYMENT_PROVIDER_READ_SERVICE)
    private readonly readService: IPaymentProviderReadService,
  ) {}

  async execute(
    query: PaymentProviderGetByIdQuery,
  ): Promise<PaymentProviderResponseDto | null> {
    const { input } = query;
    return this.readService.findById(input.id);
  }
}
