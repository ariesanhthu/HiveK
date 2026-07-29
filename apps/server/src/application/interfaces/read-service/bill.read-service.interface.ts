import { IBaseReadService } from './base.read-service.interface';
import { BillResponseDto } from '@/application/dtos';
import { BillFilterDto } from '@/application/queries';

export const BILL_READ_SERVICE = Symbol('BILL_READ_SERVICE');

export interface IBillReadService extends IBaseReadService<
  BillResponseDto,
  BillFilterDto
> {
  findByBillCode(billCode: string): Promise<BillResponseDto | null>;
  findByEnterpriseId(enterpriseId: string): Promise<BillResponseDto[]>;
  findUnpaidBills(enterpriseId: string): Promise<BillResponseDto[]>;
}
