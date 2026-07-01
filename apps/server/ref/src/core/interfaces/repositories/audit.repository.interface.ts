import { type IRepository } from '@/core/interfaces';
import { type PaymentEventEntity } from '@/core/entities';
import type { UnknownRecord } from '@/shared/types';

export const AuditRepository = Symbol('AuditRepository');

export interface IAuditRepository extends IRepository<PaymentEventEntity> {
	findByPaymentId(filter: UnknownRecord): Promise<PaymentEventEntity[]>;
	findMany(filter: UnknownRecord): Promise<PaymentEventEntity[]>;
}
