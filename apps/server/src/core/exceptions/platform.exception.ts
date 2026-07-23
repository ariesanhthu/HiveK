import {
  ConflictDomainException,
  NotFoundDomainException,
} from '../common/exceptions/domain.exception';

export class PlatformNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Platform with identifier '${identifier}' not found`);
  }
}

export class PlatformConflictException extends ConflictDomainException {
  constructor(message: string) {
    super(message);
  }
}
