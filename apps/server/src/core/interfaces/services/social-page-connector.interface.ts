import { ESocialPlatformCode } from '@/core/enums';

/**
 * Platform-agnostic page account returned by getUserAccounts()
 */
export interface ISocialPageAccount {
  id: string;
  name: string;
  accessToken: string;
  category?: string;
  tasks?: string[];
}

/**
 * Platform-agnostic page details returned by getPageDetails()
 */
export interface ISocialPageDetails {
  id: string;
  name: string;
  accessToken: string;
  pictureUrl?: string | null;
  followerCount?: number | null;
}

/**
 * Strategy interface for connecting social pages from different platforms.
 *
 * Each platform (facebook, tiktok, instagram, etc.) implements this interface
 * and is registered in the module under a key matching its platform code.
 */
export interface ISocialPageConnector {
  /** Platform code from the ESocialPlatformCode enum */
  getPlatformCode(): ESocialPlatformCode;

  /** Exchange an authorization code for a short-lived user token */
  exchangeCodeForToken(code: string, redirectUri: string): Promise<string>;

  /** Exchange a short-lived user token for a long-lived one */
  exchangeForLongLivedToken(token: string): Promise<string>;

  /** Fetch all pages/accounts manageable by the given user token */
  getUserAccounts(token: string): Promise<ISocialPageAccount[]>;

  /** Fetch detailed information about a specific page */
  getPageDetails(
    pageToken: string,
    pageId: string,
  ): Promise<ISocialPageDetails>;
}

/**
 * Factory for looking up a connector by platform code.
 */
export interface ISocialPageConnectorFactory {
  findByCode(platformCode: string): ISocialPageConnector;
}

export const SOCIAL_PAGE_CONNECTOR = Symbol('ISocialPageConnector');
export const SOCIAL_PAGE_CONNECTORS = Symbol('SocialPageConnectors');
export const SOCIAL_PAGE_CONNECTOR_FACTORY = Symbol(
  'SocialPageConnectorFactory',
);
