import {
  BadRequestDomainException,
  ConflictDomainException,
  NotFoundDomainException,
} from '../common/exceptions/domain.exception';

export class ReviewNotFoundException extends NotFoundDomainException {
  constructor(identifier: string) {
    super(`Public review with identifier '${identifier}' not found`);
  }
}

export class ReviewSpamException extends ConflictDomainException {
  constructor(message: string = 'Review submission rejected due to spam detection') {
    super(message);
  }
}

export class ReviewInvalidStatusTransitionException extends BadRequestDomainException {
  constructor(message: string) {
    super(message);
  }
}

export class ReviewLowRecaptchaScoreException extends BadRequestDomainException {
  constructor(score: number, threshold: number = 0.5) {
    super(`reCAPTCHA score ${score} is below minimum threshold of ${threshold}`);
  }
}
