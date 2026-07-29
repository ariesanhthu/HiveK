import { IBaseReadService } from './base.read-service.interface';
import { PaymentProviderResponseDto } from '@/application/dtos';
import { PaymentProviderFilterDto } from '@/application/queries';

export const PAYMENT_PROVIDER_READ_SERVICE = Symbol(
  'PAYMENT_PROVIDER_READ_SERVICE',
);

export interface IPaymentProviderReadService extends IBaseReadService<
  PaymentProviderResponseDto,
  PaymentProviderFilterDto
> {
  findByCode(code: string): Promise<PaymentProviderResponseDto | null>;
  findAllActive(): Promise<PaymentProviderResponseDto[]>;
}
