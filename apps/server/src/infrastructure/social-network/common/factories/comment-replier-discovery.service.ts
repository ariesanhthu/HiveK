import { Injectable, Inject } from '@nestjs/common';
import { ICommentReplier, ICommentReplierDiscovery, COMMENT_REPLIERS } from '@/core/interfaces';

@Injectable()
export class CommentReplierDiscoveryService implements ICommentReplierDiscovery {
  constructor(
    @Inject(COMMENT_REPLIERS)
    private readonly repliers: Record<string, ICommentReplier>,
  ) {}

  findByCode(platformCode: string): ICommentReplier {
    const replier = this.repliers[platformCode.toLowerCase()];
    if (!replier) {
      throw new Error(`Comment replier strategy not found for platform: ${platformCode}`);
    }
    return replier;
  }
}
