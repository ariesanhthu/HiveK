import { Query } from '@nestjs/cqrs';
import { PaymentProviderGetListInputDto } from './payment-provider-get-list.dto';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';

export class PaymentProviderGetListQuery extends Query<
  PaginatedResponseDto<PaymentProviderResponseDto>
> {
  constructor(public readonly input: PaymentProviderGetListInputDto) {
    super();
  }
}
