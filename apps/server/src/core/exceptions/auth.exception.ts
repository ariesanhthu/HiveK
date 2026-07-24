import {
  BadRequestDomainException,
  ForbiddenDomainException,
  UnauthorizedDomainException,
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
