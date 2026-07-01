import { Query } from '@nestjs/cqrs';
import { PaymentProviderGetByIdInputDto } from './payment-provider-get-by-id.dto';
import { PaymentProviderResponseDto } from '@/application/dtos';

export class PaymentProviderGetByIdQuery extends Query<PaymentProviderResponseDto | null> {
  constructor(public readonly input: PaymentProviderGetByIdInputDto) {
    super();
  }
}
