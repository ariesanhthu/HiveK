import { Command } from '@nestjs/cqrs';
import { PaymentProviderUpdateInputDto } from './payment-provider-update.dto';
import { PaymentProviderResponseDto } from '@/application/dtos';

export class PaymentProviderUpdateCommand extends Command<PaymentProviderResponseDto> {
  constructor(public readonly input: PaymentProviderUpdateInputDto) {
    super();
  }
}
