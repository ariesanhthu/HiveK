import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BILL_READ_SERVICE, type IBillReadService } from '@/application/interfaces';
import { BillResponseDto } from '@/application/dtos';
import { PaginatedResponseDto } from '@/application/dtos/pagination.dto';
import { BillGetListQuery } from './bill-get-list.query';

@QueryHandler(BillGetListQuery)
export class BillGetListHandler implements IQueryHandler<BillGetListQuery, PaginatedResponseDto<BillResponseDto>> {
  constructor(
    @Inject(BILL_READ_SERVICE)
    private readonly readService: IBillReadService,
  ) {}

  async execute(query: BillGetListQuery): Promise<PaginatedResponseDto<BillResponseDto>> {
    const { input } = query;
    return this.readService.findAll(input);
  }
}
