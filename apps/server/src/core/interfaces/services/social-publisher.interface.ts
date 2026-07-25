export interface ISocialPublisher {
  publishPost(params: {
    pageToken: string;
    pageId: string;
    content: string;
    mediaUrls: string[];
  }): Promise<{ platformPostId: string }>;
}

export interface ISocialPublisherDiscovery {
  findByCode(platformCode: string): ISocialPublisher;
}

export const SOCIAL_PUBLISHER = Symbol('ISocialPublisher');
export const SOCIAL_PUBLISHERS = Symbol('SocialPublishers');
export const SOCIAL_PUBLISHER_DISCOVERY = Symbol('SocialPublisherDiscovery');
