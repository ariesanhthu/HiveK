import {
  DomainException,
  BadRequestDomainException,
  ConflictDomainException,
} from '../common/exceptions/domain.exception';

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

export class OtpRateLimitException extends ConflictDomainException {
  constructor(
    message: string = 'Please wait 1 minute before requesting another OTP',
  ) {
    super(message);
  }
}

import { NotFoundDomainException } from '../common/exceptions/domain.exception';

export class CampaignParticipantNotFoundException extends NotFoundDomainException {
  constructor(id: string) {
    super(`Campaign participant with ID '${id}' not found`);
  }
}
