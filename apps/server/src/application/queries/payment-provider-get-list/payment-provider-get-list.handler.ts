import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PAYMENT_PROVIDER_READ_SERVICE, type IPaymentProviderReadService } from '@/application/interfaces';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { PaymentProviderGetListQuery } from './payment-provider-get-list.query';

@QueryHandler(PaymentProviderGetListQuery)
export class PaymentProviderGetListHandler implements IQueryHandler<PaymentProviderGetListQuery, PaginatedResponseDto<PaymentProviderResponseDto>> {
  constructor(
    @Inject(PAYMENT_PROVIDER_READ_SERVICE)
    private readonly readService: IPaymentProviderReadService,
  ) {}

  async execute(query: PaymentProviderGetListQuery): Promise<PaginatedResponseDto<PaymentProviderResponseDto>> {
    const { input } = query;
    return this.readService.findAll(input);
  }
}
