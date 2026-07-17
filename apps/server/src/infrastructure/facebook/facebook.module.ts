import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FacebookGraphApiClient } from './facebook-graph-api.client';
import { FacebookPublisherService } from './facebook-publisher.service';
import { FacebookCommentReplierService } from './facebook-comment-replier.service';
import { FacebookTokenService } from './facebook-token.service';
import { FacebookSocialPageConnectorService } from './facebook-social-page-connector.service';

@Module({
  imports: [HttpModule],
  providers: [
    FacebookGraphApiClient,
    FacebookPublisherService,
    FacebookCommentReplierService,
    FacebookTokenService,
    FacebookSocialPageConnectorService,
  ],
  exports: [
    FacebookGraphApiClient,
    FacebookPublisherService,
    FacebookCommentReplierService,
    FacebookTokenService,
    FacebookSocialPageConnectorService,
  ],
})
export class FacebookModule {}
