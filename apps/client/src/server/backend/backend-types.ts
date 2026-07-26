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
  type?: "enterprise" | "kol" | "admin" | string;
  role?: "enterprise" | "kol" | "admin" | string;
  isEmailVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  status?: string;
  enterpriseIds?: string[];
};

export type BackendEnterpriseMember = {
  userId: string;
  mode: "owner" | "member" | string;
};

export type BackendEnterpriseKnowledgeBase = {
  rawText?: string | null;
  externalLinks?: string[] | null;
  updatedAt?: string | null;
};

export type BackendEnterpriseProfile = {
  id: string;
  userId: string;
  companyName: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  website?: string | null;
  taxId?: string | null;
  logoUrlId?: string | null;
  isVerified?: boolean;
  members?: BackendEnterpriseMember[];
  knowledgeBase?: BackendEnterpriseKnowledgeBase | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendEnterpriseMeData = {
  data: BackendEnterpriseProfile[];
  cursor?: string | null;
  hasNext?: boolean;
  limit?: number;
};

export type BackendPlatformIcon = {
  id?: string;
  url?: string;
  publicId?: string;
  size?: number;
  format?: string;
  title?: string;
};

export type BackendPlatform = {
  id: string;
  name: string;
  baseUrl?: string;
  apiStatus?: "stable" | "maintenance" | "deprecated" | string;
  icon?: BackendPlatformIcon | null;
};

export type BackendPlatformListData = {
  data: BackendPlatform[];
  cursor?: string | null;
  hasNext?: boolean;
  limit?: number;
};

export type BackendSocialPage = {
  id: string;
  enterpriseId: string;
  platformId?: string;
  platformCode: "facebook" | "threads" | string;
  pageId: string;
  pageName?: string | null;
  name?: string | null;
  username?: string | null;
  pictureUrl?: string | null;
  avatarUrl?: string | null;
  followerCount?: number;
  webhookVerifyToken?: string | null;
  status?: string;
  isActive?: boolean;
  connectedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
  platformTarget?: Array<{
    platformId?: string;
    minFollowers?: number;
    maxFollowers?: number;
    note?: string;
    others?: Record<string, unknown>;
  }> | null;
  status?: string | null;
  collaboratorIds?: string[] | null;
  rawContents?: Array<{
    fileId?: string;
    rawContent?: string;
  }> | null;
  schedule?: {
    timeline?: Array<{
      date?: unknown;
      label?: string;
      posts?: unknown[];
    }>;
  } | null;
  participants?: BackendCampaignParticipant[] | null;
};
