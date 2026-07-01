import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BillGetListQuery } from './bill-get-list.query';
import { PaginationCursorResponseDto } from '@/shared/dtos';
import type { BillResponseDto } from '@/application/dtos';
import { BillMapper } from '@/application/mappers';
import { BILL_REPOSITORY, type IBillRepository } from '@/core';
import { ESortOrder } from '@/shared/enums';

@QueryHandler(BillGetListQuery)
export class BillGetListHandler implements IQueryHandler<BillGetListQuery> {
	constructor(
		@Inject(BILL_REPOSITORY)
		private readonly billRepository: IBillRepository
	) {}

	async execute(query: BillGetListQuery): Promise<PaginationCursorResponseDto<BillResponseDto>> {
		const { enterpriseId, limit, cursor, status } = query.dto;

		const fetchLimit = limit + 1;

		const bills = await this.billRepository.findMany({
			enterpriseId,
			limit: fetchLimit,
			cursor,
			status: status ? status : undefined,
			sortOrder: ESortOrder.DESC, // Default to DESC
		});

		const hasNextPage = bills.length >= fetchLimit;
		if (hasNextPage) {
			bills.pop();
		}

		return {
			items: BillMapper.toDtoList(bills),
			nextCursor: hasNextPage && bills.length > 0 ? bills[bills.length - 1].id : null,
		};
	}
}
