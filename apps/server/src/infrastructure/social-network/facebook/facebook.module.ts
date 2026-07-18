import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FacebookGraphApiClient } from './facebook-graph-api.client';
import { FacebookPublisherService } from './facebook-publisher.service';
import { FacebookCommentReplierService } from './facebook-comment-replier.service';
import { FacebookOAuthConfigService } from './facebook-oauth-config.service';
import { FacebookSocialPageConnectorService } from './facebook-social-page-connector.service';

@Module({
  imports: [HttpModule],
  providers: [
    FacebookGraphApiClient,
    FacebookPublisherService,
    FacebookCommentReplierService,
    FacebookOAuthConfigService,
    FacebookSocialPageConnectorService,
  ],
  exports: [
    FacebookGraphApiClient,
    FacebookPublisherService,
    FacebookCommentReplierService,
    FacebookOAuthConfigService,
    FacebookSocialPageConnectorService,
  ],
})
export class FacebookModule {}
