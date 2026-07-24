import {
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../common/exceptions/domain.exception';

export class NotificationNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Notification with identifier '${identifier}' not found`);
  }
}

export class NotificationForbiddenException extends ForbiddenDomainException {
  constructor(message: string) {
    super(message);
  }
}
