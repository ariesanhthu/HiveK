/**
 * Global API Scope Definitions for the Threads Platform
 */
export type ThreadsPermissionScope =
  | 'threads_basic'
  | 'threads_content_publish'
  | 'threads_manage_insights'
  | 'threads_manage_replies'
  | 'threads_read_replies';

/**
 * Valid Media Format Identifiers
 */
export type ThreadsMediaType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL';

/**
 * Access Control for Replies
 */
export type ThreadsReplyControl =
  | 'everyone'
  | 'accounts_you_follow'
  | 'mentioned_only';

/**
 * Interactive Analytics Metric Identifiers
 */
export type ThreadsMetricType =
  | 'views'
  | 'likes'
  | 'replies'
  | 'reposts'
  | 'shares'
  | 'quotes';

// ==========================================
// AUTHENTICATION INTERFACES
// ==========================================

export interface ShortLivedTokenRequest {
  client_id: string;
  client_secret: string;
  grant_type: 'authorization_code';
  redirect_uri: string;
  code: string;
}

export interface ShortLivedTokenResponse {
  access_token: string;
  user_id: string;
}

export interface LongLivedTokenRequest {
  grant_type: 'th_exchange_token';
  client_secret: string;
  access_token: string;
}

export interface LongLivedTokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // Expiration lifetime in seconds
}

export interface TokenRefreshRequest {
  grant_type: 'th_refresh_token';
  access_token: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number; // Reset expiration lifetime in seconds
}

// ==========================================
// USER PROFILE INTERFACES
// ==========================================

export interface UserProfileResponse {
  id: string;
  username: string;
  name?: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
}

// ==========================================
// PUBLISHING & CONTAINER INTERFACES
// ==========================================

export interface BaseContainerRequest {
  media_type: ThreadsMediaType;
  text?: string; // Max 500 characters
  reply_control?: ThreadsReplyControl;
  reply_to_id?: string; // Identifies parent post for replies
  location_id?: string;
  topic_tag?: string; // Explicit category tagging
}

export interface ImageContainerRequest extends BaseContainerRequest {
  media_type: 'IMAGE';
  image_url: string; // Public HTTPS URL
  alt_text?: string;
}

export interface VideoContainerRequest extends BaseContainerRequest {
  media_type: 'VIDEO';
  video_url: string; // Public HTTPS URL
  alt_text?: string;
}

export interface CarouselChildContainerRequest {
  media_type: 'IMAGE' | 'VIDEO';
  image_url?: string; // Required if media_type is IMAGE
  video_url?: string; // Required if media_type is VIDEO
  is_carousel_item: true;
  alt_text?: string;
}

export interface CarouselParentContainerRequest extends BaseContainerRequest {
  media_type: 'CAROUSEL';
  children: string[]; // Ordered list of child container IDs
}

export interface ContainerCreationResponse {
  id: string; // Temporary container creation_id
}

export interface ContainerStatusResponse {
  id: string;
  status_code: 'EXPIRED' | 'FAILED' | 'FINISHED' | 'IN_PROGRESS';
  error_message?: string;
}

export interface PublishRequest {
  creation_id: string;
}

export interface PublishResponse {
  id: string; // Final public Threads Media ID
}

// ==========================================
// POST DELETION INTERFACES
// ==========================================

export interface PostDeletionResponse {
  success: boolean;
}

// ==========================================
// METRICS & ANALYTICS INTERFACES
// ==========================================

export interface MetricValue {
  name: ThreadsMetricType;
  period: 'day' | 'lifetime';
  values: Array<{ value: number }>;
  title: string;
  description: string;
}

export interface PostAnalyticsResponse {
  data: MetricValue[];
}
