import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BillGetByIdQuery } from './bill-get-by-id.query';
import { BillResponseDto } from '@/application/dtos';
import { BillMapper } from '@/application/mappers';
import { BILL_REPOSITORY, type IBillRepository } from '@/core';
import { BillNotFoundException } from '@/core';

@QueryHandler(BillGetByIdQuery)
export class BillGetByIdHandler implements IQueryHandler<BillGetByIdQuery> {
	constructor(
		@Inject(BILL_REPOSITORY)
		private readonly billRepository: IBillRepository
	) {}

	async execute(query: BillGetByIdQuery): Promise<BillResponseDto> {
		const { id } = query.dto;
		const bill = await this.billRepository.findById(id);
		if (!bill) {
			throw new BillNotFoundException(id);
		}
		return BillMapper.toDto(bill);
	}
}
