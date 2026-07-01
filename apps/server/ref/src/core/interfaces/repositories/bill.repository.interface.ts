import { type IRepository } from '@/core/interfaces';
import { type BillEntity } from '@/core/aggregate-roots';

export const BILL_REPOSITORY = Symbol('BILL_REPOSITORY');

export interface IBillRepository extends IRepository<BillEntity> {
	findByBillCode(billCode: string): Promise<BillEntity | null>;
	findByEnterpriseId(enterpriseId: string): Promise<BillEntity[]>;
	findUnpaidBills(enterpriseId: string): Promise<BillEntity[]>;
}
