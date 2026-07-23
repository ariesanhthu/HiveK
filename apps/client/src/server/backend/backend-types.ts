export type BackendErrorPayload = {
  code?: string;
  message?: string | string[];
  details?: unknown;
};

export type BackendEnvelope<TData = unknown, TMeta = unknown> = {
  success: boolean;
  data: TData;
  error: BackendErrorPayload | null;
  meta: TMeta | null;
};

export type BackendPaginatedMeta = {
  cursor?: string | null;
  has_next?: boolean;
  hasNext?: boolean;
  limit?: number;
};

export type BackendPaginatedResponse<T> = BackendEnvelope<
  T[],
  BackendPaginatedMeta
>;

export type BackendAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type BackendUserProfile = {
  id: string;
  email: string;
  phone?: string | null;
  fullName?: string | null;
  avatar?: unknown;
  roleId?: string;
  type?: 'enterprise' | 'kol' | 'admin' | string;
  isEmailVerified?: boolean;
  enterpriseIds?: string[];
};

export type BackendKolPlatform = {
  platformId: string;
  uniqueId?: string | null;
  externalId?: string | null;
  followerCount?: number | null;
  avgEngagement?: number | null;
  topTags?: string[] | null;
  categories?: string[] | null;
};

export type BackendKolProfile = {
  id: string;
  userId?: string | null;
  verificationType?: string | null;
  name?: string | null;
  location?: string | null;
  gender?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  isVerified?: boolean;
  scores?: Record<string, unknown> | null;
  platforms?: BackendKolPlatform[] | null;
};

export type BackendCampaignParticipant = {
  id: string;
  kolProfileId?: string;
  status?: string;
  joinedAt?: unknown;
};

export type BackendCampaign = {
  id: string;
  ownerId?: string;
  enterpriseId?: string | null;
  budget?: number | null;
  financialTarget?: Record<string, unknown> | null;
  description?: string | null;
  platformTarget?:
    | Array<{
      platformId?: string;
      minFollowers?: number;
      maxFollowers?: number;
      note?: string;
      others?: Record<string, unknown>;
    }>
    | null;
  status?: string | null;
  collaboratorIds?: string[] | null;
  rawContents?:
    | Array<{
      fileId?: string;
      rawContent?: string;
    }>
    | null;
  schedule?: {
    timeline?: Array<{
      date?: unknown;
      label?: string;
      posts?: unknown[];
    }>;
  } | null;
  participants?: BackendCampaignParticipant[] | null;
};
