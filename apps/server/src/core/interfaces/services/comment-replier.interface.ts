export interface ICommentReplier {
  replyToComment(params: {
    pageToken: string;
    commentId: string;
    message: string;
  }): Promise<void>;
}

export interface ICommentReplierDiscovery {
  findByCode(platformCode: string): ICommentReplier;
}

export const COMMENT_REPLIER = Symbol('ICommentReplier');
export const COMMENT_REPLIERS = Symbol('CommentRepliers');
export const COMMENT_REPLIER_DISCOVERY = Symbol('CommentReplierDiscovery');
