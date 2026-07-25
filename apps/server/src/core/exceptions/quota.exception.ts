import { DomainException } from '../common/exceptions/domain.exception';

export class QuotaExceededException extends DomainException {
  constructor(enterpriseId: string, quotaKey: string) {
    super(`Enterprise ${enterpriseId} has exceeded renewable quota limit for key: ${quotaKey}`);
  }
}
