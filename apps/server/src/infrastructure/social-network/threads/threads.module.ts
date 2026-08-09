import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ThreadsGraphApiClient } from './threads-graph-api.client';
import { ThreadsOAuthConfigService } from './threads-oauth-config.service';
import { ThreadsSocialPageConnectorService } from './threads-social-page-connector.service';
import { ThreadsPublisherService } from './threads-publisher.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://graph.threads.net/v1.0',
    }),
  ],
  providers: [
    ThreadsGraphApiClient,
    ThreadsOAuthConfigService,
    ThreadsSocialPageConnectorService,
    ThreadsPublisherService,
  ],
  exports: [
    ThreadsGraphApiClient,
    ThreadsOAuthConfigService,
    ThreadsSocialPageConnectorService,
    ThreadsPublisherService,
  ],
})
export class ThreadsModule {}
