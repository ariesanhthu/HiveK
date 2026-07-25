import { Command } from '@nestjs/cqrs';
import { PaymentProviderCreateInputDto } from './payment-provider-create.dto';
import { PaymentProviderResponseDto } from '@/application/dtos';

export class PaymentProviderCreateCommand extends Command<PaymentProviderResponseDto> {
  constructor(public readonly input: PaymentProviderCreateInputDto) {
    super();
  }
}
