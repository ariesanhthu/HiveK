import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FacebookModule } from '../facebook/facebook.module';
import { FacebookPublisherService } from '../facebook/facebook-publisher.service';
import { FacebookCommentReplierService } from '../facebook/facebook-comment-replier.service';
import { SocialPublisherDiscoveryService } from '../posting/social-publisher-discovery.service';
import { CommentReplierDiscoveryService } from '../posting/comment-replier-discovery.service';
import { PostPublishJob } from '../posting/jobs/post-publish.job';
import { CommentWebhookConsumer } from '../../presentation/controllers/rmq/comment-webhook.consumer';
import {
  SOCIAL_PUBLISHERS,
  SOCIAL_PUBLISHER_DISCOVERY,
  COMMENT_REPLIERS,
  COMMENT_REPLIER_DISCOVERY,
} from '@/core/interfaces';

// Import all Command and Query Handlers
import {
  SocialPageConnectHandler,
  SocialPageDisconnectHandler,
  SocialPageBulkConnectHandler,
  ScheduledPostCreateHandler,
  ScheduledPostCreateAndPublishHandler,
  ScheduledPostScheduleHandler,
  ScheduledPostCancelHandler,
  ScheduledPostRescheduleHandler,
  ScheduledPostPublishHandler,
  AutoReplyRuleCreateHandler,
  AutoReplyRuleUpdateHandler,
  AutoReplyRuleDeleteHandler,
  CommentWebhookHandleHandler,
  SocialPageRefreshTokenHandler,
} from '@/application/commands';

import {
  SocialPageGetListHandler,
  ScheduledPostGetListHandler,
  ScheduledPostGetByIdHandler,
  AutoReplyRuleGetListHandler,
} from '@/application/queries';

import {
  SocialPageController,
  ScheduledPostController,
  AutoReplyRuleController,
  FacebookWebhookController,
  ScheduledPostRmqController,
} from '@/presentation/controllers';

import { StateAuthGuard } from '@/presentation/middleware/guards';

const Handlers = [
  SocialPageConnectHandler,
  SocialPageDisconnectHandler,
  SocialPageBulkConnectHandler,
  ScheduledPostCreateHandler,
  ScheduledPostCreateAndPublishHandler,
  ScheduledPostScheduleHandler,
  ScheduledPostCancelHandler,
  ScheduledPostRescheduleHandler,
  ScheduledPostPublishHandler,
  AutoReplyRuleCreateHandler,
  AutoReplyRuleUpdateHandler,
  AutoReplyRuleDeleteHandler,
  CommentWebhookHandleHandler,
  SocialPageRefreshTokenHandler,
  SocialPageGetListHandler,
  ScheduledPostGetListHandler,
  ScheduledPostGetByIdHandler,
  AutoReplyRuleGetListHandler,
];

@Module({
  imports: [
    CqrsModule,
    FacebookModule,
  ],
  controllers: [
    SocialPageController,
    ScheduledPostController,
    AutoReplyRuleController,
    FacebookWebhookController,
  ],
  providers: [
    {
      provide: SOCIAL_PUBLISHERS,
      inject: [FacebookPublisherService],
      useFactory: (facebook: FacebookPublisherService) => ({
        facebook,
      }),
    },
    {
      provide: SOCIAL_PUBLISHER_DISCOVERY,
      useClass: SocialPublisherDiscoveryService,
    },
    {
      provide: COMMENT_REPLIERS,
      inject: [FacebookCommentReplierService],
      useFactory: (facebook: FacebookCommentReplierService) => ({
        facebook,
      }),
    },
    {
      provide: COMMENT_REPLIER_DISCOVERY,
      useClass: CommentReplierDiscoveryService,
    },
    PostPublishJob,
    CommentWebhookConsumer,
    StateAuthGuard,
    ...Handlers,
    ScheduledPostRmqController,
  ],
  exports: [
    SOCIAL_PUBLISHER_DISCOVERY,
    COMMENT_REPLIER_DISCOVERY,
    FacebookModule,
    PostPublishJob,
    CommentWebhookConsumer,
    StateAuthGuard,
    ...Handlers,
  ],
})
export class PostingModule {}
