import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BILL_READ_SERVICE, type IBillReadService } from '@/application/interfaces';
import { BillResponseDto } from '@/application/dtos';
import { BillGetByIdQuery } from './bill-get-by-id.query';

@QueryHandler(BillGetByIdQuery)
export class BillGetByIdHandler implements IQueryHandler<BillGetByIdQuery, BillResponseDto | null> {
  constructor(
    @Inject(BILL_READ_SERVICE)
    private readonly readService: IBillReadService,
  ) {}

  async execute(query: BillGetByIdQuery): Promise<BillResponseDto | null> {
    const { input } = query;
    return this.readService.findById(input.id);
  }
}
