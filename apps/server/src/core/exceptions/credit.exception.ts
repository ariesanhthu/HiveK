import { DomainException } from '../common/exceptions/domain.exception';

export class InsufficientCreditException extends DomainException {
  constructor(
    enterpriseId: string,
    creditType: string,
    required: number,
    available: number,
  ) {
    super(
      `Enterprise ${enterpriseId} has insufficient ${creditType} credit. Required: ${required}, Available: ${available}`,
    );
  }
}
