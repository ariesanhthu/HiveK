import { ForbiddenDomainException, NotFoundDomainException } from '../common/exceptions/domain.exception';

export class CampaignNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Campaign with identifier '${identifier}' not found`);
  }
}

export class CampaignForbiddenException extends ForbiddenDomainException {
  constructor() {
    super('User does not have permission to perform this action');
  }
}