import {
  NotFoundDomainException,
  ConflictDomainException,
  ForbiddenDomainException,
  UnauthorizedDomainException,
} from '../common/exceptions/domain.exception';

export class UserNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`User with identifier '${identifier}' not found`);
  }
}

export class UserConflictException extends ConflictDomainException {
  constructor(message: string) {
    super(message);
  }
}

export class UserForbiddenException extends ForbiddenDomainException {
  constructor(
    message: string = 'You are not authorized to access/modify this user profile',
  ) {
    super(message);
  }
}

export class UserUnauthorizedException extends UnauthorizedDomainException {
  constructor(message: string = 'Authentication required') {
    super(message);
  }
}
