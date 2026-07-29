/**
 * Valid Instagram Media Types for the Graph API
 */
export type InstagramMediaType =
  | 'IMAGE'
  | 'VIDEO'
  | 'REELS'
  | 'STORIES'
  | 'CAROUSEL';

/**
 * Container processing status codes
 */
export type ContainerStatusCode =
  | 'EXPIRED'
  | 'FAILED'
  | 'FINISHED'
  | 'IN_PROGRESS';

/**
 * OAuth permission scopes required for Instagram posting
 */
export type InstagramOAuthScope =
  | 'instagram_basic'
  | 'instagram_content_publish'
  | 'pages_show_list'
  | 'pages_read_engagement';

// ==========================================
// AUTHENTICATION INTERFACES
// ==========================================

export interface ShortLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number; // ~3600s for short-lived
}

export interface LongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // ~5183944s (60 days)
}

export interface TokenRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// ==========================================
// ACCOUNT DISCOVERY INTERFACES
// ==========================================

export interface InstagramBusinessAccount {
  id: string;
  name?: string;
  username?: string;
  profile_picture_url?: string;
}

export interface LinkedFacebookPage {
  id: string;
  name: string;
  instagram_business_account?: InstagramBusinessAccount;
}

export interface FacebookAccountsResponse {
  data: LinkedFacebookPage[];
}

export interface InstagramAccountDetails {
  id: string;
  name?: string;
  username?: string;
  profile_picture_url?: string;
  followers_count?: number;
  media_count?: number;
}

// ==========================================
// CONTAINER CREATION INTERFACES
// ==========================================

export interface BaseContainerRequest {
  caption?: string; // Max 2,200 characters
  user_tags?: string;
  location_id?: string;
}

export interface ImageContainerRequest extends BaseContainerRequest {
  image_url: string; // Public HTTPS URL, max 8MB
}

export interface VideoContainerRequest extends BaseContainerRequest {
  media_type: 'VIDEO' | 'REELS';
  video_url: string; // Public HTTPS URL, max 300MB, 3s-60min
}

export interface CarouselChildRequest {
  is_carousel_item: true;
  image_url?: string; // Required if child is image
  video_url?: string; // Required if child is video
}

export interface CarouselParentRequest extends BaseContainerRequest {
  media_type: 'CAROUSEL';
  children: string[]; // Ordered array of verified child container IDs, 2-10 items
}

export interface StoriesContainerRequest {
  media_type: 'STORIES';
  image_url?: string;
  video_url?: string;
}

export type CreateContainerParams =
  | ({ access_token: string } & ImageContainerRequest)
  | ({ access_token: string } & VideoContainerRequest)
  | ({ access_token: string } & CarouselParentRequest)
  | ({ access_token: string } & StoriesContainerRequest)
  | ({ access_token: string } & CarouselChildRequest);

export interface ContainerCreationResponse {
  id: string; // Staged container ID (has 24h TTL)
}

// ==========================================
// STATUS POLLING INTERFACES
// ==========================================

export interface ContainerStatusResponse {
  id: string;
  status_code: ContainerStatusCode;
  error_message?: string;
}

// ==========================================
// PUBLISHING INTERFACES
// ==========================================

export interface PublishRequest {
  creation_id: string;
}

export interface PublishResponse {
  id: string; // Final live Instagram Media ID
}

// ==========================================
// RATE LIMIT MONITORING
// ==========================================

export interface BusinessUsageEntry {
  type: string;
  call_count: number;
  total_cputime: number;
  total_time: number;
  estimated_time_to_regain_limit: number;
}

export interface BusinessUsageHeader {
  [igUserId: string]: BusinessUsageEntry[];
}

// ==========================================
// MEDIA INSIGHTS
// ==========================================

export interface MediaInsightValue {
  name: string;
  period: 'day' | 'lifetime';
  values: Array<{ value: number }>;
  title: string;
  description: string;
}

export interface MediaInsightsResponse {
  data: MediaInsightValue[];
}
