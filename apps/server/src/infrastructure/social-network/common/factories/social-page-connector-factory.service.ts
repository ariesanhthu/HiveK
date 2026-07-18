import { Injectable, Inject } from '@nestjs/common';
import {
  ISocialPageConnector,
  ISocialPageConnectorFactory,
  SOCIAL_PAGE_CONNECTORS,
} from '@/core/interfaces';

@Injectable()
export class SocialPageConnectorFactoryService
  implements ISocialPageConnectorFactory
{
  constructor(
    @Inject(SOCIAL_PAGE_CONNECTORS)
    private readonly connectors: Record<string, ISocialPageConnector>,
  ) {}

  findByCode(platformCode: string): ISocialPageConnector {
    const connector = this.connectors[platformCode.toLowerCase()];
    if (!connector) {
      throw new Error(
        `Social page connector strategy not found for platform: ${platformCode}`,
      );
    }
    return connector;
  }
}
