import { Injectable, Inject } from '@nestjs/common';
import { ISocialPublisher, ISocialPublisherDiscovery, SOCIAL_PUBLISHERS } from '@/core/interfaces';

@Injectable()
export class SocialPublisherDiscoveryService implements ISocialPublisherDiscovery {
  constructor(
    @Inject(SOCIAL_PUBLISHERS)
    private readonly publishers: Record<string, ISocialPublisher>,
  ) {}

  findByCode(platformCode: string): ISocialPublisher {
    const publisher = this.publishers[platformCode.toLowerCase()];
    if (!publisher) {
      throw new Error(`Social publisher strategy not found for platform: ${platformCode}`);
    }
    return publisher;
  }
}
