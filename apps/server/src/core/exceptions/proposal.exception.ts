import {
  BadRequestDomainException,
  ForbiddenDomainException,
  NotFoundDomainException,
} from '../common/exceptions/domain.exception';

export class ProposalNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Campaign proposal with identifier '${identifier}' not found`);
  }
}

export class ProposalForbiddenException extends ForbiddenDomainException {
  constructor() {
    super('User does not have permission to perform this action on the proposal');
  }
}

export class ProposalInvalidStatusTransitionException extends BadRequestDomainException {
  constructor(from: string, to: string) {
    super(`Cannot transition proposal status from '${from}' to '${to}'`);
  }
}
