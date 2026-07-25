import { IBaseRepository } from '../../common';
import { PaymentEntity } from '../../aggregate-roots/payment.aggregate';

export interface IPaymentRepository extends IBaseRepository<PaymentEntity> {
  findByUserId(userId: string): Promise<PaymentEntity[]>;
  findActiveByBillId(billId: string): Promise<PaymentEntity | null>;
  findAllByBillId(billId: string): Promise<PaymentEntity[]>;
  hasActivePaymentForBill(billId: string): Promise<boolean>;
  findByIdempotencyKey(key: string): Promise<PaymentEntity | null>;
  findByAttemptId(attemptId: string): Promise<PaymentEntity | null>;
}

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');
