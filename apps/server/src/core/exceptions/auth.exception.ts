import {
  UnauthorizedDomainException,
  ForbiddenDomainException,
  BadRequestDomainException,
} from '../common/exceptions/domain.exception';

export class InvalidCredentialsException extends UnauthorizedDomainException {
  constructor(message: string = 'Invalid credentials') {
    super(message);
  }
}

export class InvalidRefreshTokenException extends UnauthorizedDomainException {
  constructor(message: string = 'Invalid or expired refresh token') {
    super(message);
  }
}

export class InvalidPasswordException extends BadRequestDomainException {
  constructor(message: string = 'Invalid old password') {
    super(message);
  }
}

export class UserDeletedException extends ForbiddenDomainException {
  constructor(message: string = 'User has been deleted') {
    super(message);
  }
}

export class InvalidUserTypeException extends BadRequestDomainException {
  constructor(message: string) {
    super(message);
  }
}

export class WorkspaceAccessException extends ForbiddenDomainException {
  constructor(message: string = 'User does not have access to this workspace') {
    super(message);
  }
}

export class EntitlementDeniedException extends ForbiddenDomainException {
  constructor(message: string = 'User does not have the required entitlement') {
    super(message);
  }
}
