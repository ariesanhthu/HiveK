import { NotFoundDomainException } from '../common/exceptions/domain.exception';

export class CampaignNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Campaign with identifier '${identifier}' not found`);
  }
}
