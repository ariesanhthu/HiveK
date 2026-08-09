import {
  NotFoundDomainException,
  ConflictDomainException,
} from '../common/exceptions/domain.exception';

export class RoleNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Role with identifier '${identifier}' not found`);
  }
}

export class RoleConflictException extends ConflictDomainException {
  constructor(message: string) {
    super(message);
  }
}
