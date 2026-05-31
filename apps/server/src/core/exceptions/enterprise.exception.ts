import { NotFoundDomainException, ConflictDomainException, ForbiddenDomainException } from '../common/exceptions/domain.exception';

export class EnterpriseNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Enterprise with identifier '${identifier}' not found`);
  }
}

export class EnterpriseConflictException extends ConflictDomainException {
  constructor(message: string) {
    super(message);
  }
}

export class EnterpriseForbiddenException extends ForbiddenDomainException {
  constructor(message: string = 'You do not own this enterprise profile') {
    super(message);
  }
}
