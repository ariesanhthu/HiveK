import { Command } from '@nestjs/cqrs';
import { PaymentCreateInputDto, PaymentCreateResponseDto } from './payment-create.dto';

export class PaymentCreateCommand extends Command<PaymentCreateResponseDto> {
  constructor(public readonly input: PaymentCreateInputDto) {
    super();
  }
}
