import { Injectable, Inject } from '@nestjs/common';
import { BILL_REPOSITORY, type IBillRepository } from '@/core';
import { BillEntity } from '@/core';
import { IUnitOfWorkSession } from '@/core/interfaces';

@Injectable()
export class BillLookup {
	constructor(
		@Inject(BILL_REPOSITORY)
		private readonly billRepository: IBillRepository
	) {}

	async findBill(id: string, session?: IUnitOfWorkSession): Promise<BillEntity | null> {
		const repo = session ? session.billRepository : this.billRepository;
		return repo.findById(id);
	}

	async findBills(ids: string[], session?: IUnitOfWorkSession): Promise<BillEntity[]> {
		if (!ids.length) return [];
		const repo = session ? session.billRepository : this.billRepository;
		return repo.findByIds(ids);
	}

	async findBillByCode(
		billCode: string,
		session?: IUnitOfWorkSession
	): Promise<BillEntity | null> {
		const repo = session ? session.billRepository : this.billRepository;
		return repo.findByBillCode(billCode);
	}

	async billExists(id: string, session?: IUnitOfWorkSession): Promise<boolean> {
		const repo = session ? session.billRepository : this.billRepository;
		return repo.exists(id);
	}
}
