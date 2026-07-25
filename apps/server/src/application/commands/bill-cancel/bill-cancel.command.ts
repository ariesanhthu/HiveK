import { Command } from '@nestjs/cqrs';
import { BillCancelInputDto } from './bill-cancel.dto';

export class BillCancelCommand extends Command<void> {
  constructor(public readonly input: BillCancelInputDto) {
    super();
  }
}
