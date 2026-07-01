import { Command } from '@nestjs/cqrs';
import { BillCreateInputDto } from './bill-create.dto';
import { BillResponseDto } from '@/application/dtos';

export class BillCreateCommand extends Command<BillResponseDto> {
  constructor(public readonly input: BillCreateInputDto) {
    super();
  }
}
