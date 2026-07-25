import { IBaseRepository } from '../../common';
import { BillEntity } from '../../aggregate-roots/bill.aggregate';

export interface IBillRepository extends IBaseRepository<BillEntity> {
  findByBillCode(billCode: string): Promise<BillEntity | null>;
  findByEnterpriseId(enterpriseId: string): Promise<BillEntity[]>;
  findUnpaidBills(enterpriseId: string): Promise<BillEntity[]>;
}

export const BILL_REPOSITORY = Symbol('IBillRepository');
