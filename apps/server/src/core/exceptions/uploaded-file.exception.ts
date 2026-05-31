import { NotFoundDomainException } from '../common/exceptions/domain.exception';

export class UploadedFileNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`File with identifier '${identifier}' not found`);
  }
}
