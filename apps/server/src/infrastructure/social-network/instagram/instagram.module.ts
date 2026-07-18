import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InstagramGraphApiClient } from './instagram-graph-api.client';
import { InstagramOAuthConfigService } from './instagram-oauth-config.service';
import { InstagramSocialPageConnectorService } from './instagram-social-page-connector.service';
import { InstagramPublisherService } from './instagram-publisher.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://graph.facebook.com/v25.0',
    }),
  ],
  providers: [
    InstagramGraphApiClient,
    InstagramOAuthConfigService,
    InstagramSocialPageConnectorService,
    InstagramPublisherService,
  ],
  exports: [
    InstagramGraphApiClient,
    InstagramOAuthConfigService,
    InstagramSocialPageConnectorService,
    InstagramPublisherService,
  ],
})
export class InstagramModule { }
