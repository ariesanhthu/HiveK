import { DomainException, BadRequestDomainException } from '../common/exceptions/domain.exception';

export class GeneralDomainException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidOperationException extends BadRequestDomainException {
  constructor(message: string) {
    super(message);
  }
}
