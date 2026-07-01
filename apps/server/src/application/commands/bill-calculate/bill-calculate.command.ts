import { Command } from '@nestjs/cqrs';
import { BillCalculateInputDto } from './bill-calculate.dto';
import { BillCalculateResponseDto } from '@/application/dtos';

export class BillCalculateCommand extends Command<BillCalculateResponseDto> {
  constructor(public readonly input: BillCalculateInputDto) {
    super();
  }
}
