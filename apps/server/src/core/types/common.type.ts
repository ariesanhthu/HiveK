export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type OptionalNullable<T> = T | null | undefined;

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;

export type JsonObject = { [key: string]: JsonValue };

// Common flexible data structures
export type Dictionary<T = unknown> = Record<string, T>;

export type PaginationFilters = {
  cursor?: string;
  limit?: number;
  sort?: 'asc' | 'desc';
};

// File related types
export interface FileInfo {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface UploadedFileType {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  targetId?: string;
  targetType?: string;
}

// Platform configuration
export interface PlatformConfig {
  platformId: string;
  icon?: string;
  apiStatus?: string;
}

// OAuth related types
export interface OAuthProfile {
  id: string;
  emails?: Array<{ value: string; verified: boolean }>;
  displayName?: string;
  photos?: Array<{ value: string }>;
  provider: string;
}

// WebSocket message types
export interface WebSocketMessage {
  event: string;
  data: unknown;
}

// Event payload types
export interface DomainEventPayload<T = unknown> {
  eventType: string;
  data: T;
  timestamp: Date;
}

export interface IntegrationEventPayload<T = unknown> extends DomainEventPayload<T> {
  correlationId?: string;
}

// HTTP Request types
export interface AuthenticatedRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  cookies?: Record<string, string>;
  headers?: Record<string, string | undefined>;
  method?: string;
  url?: string;
}
// RabbitMQ message types
export interface RmqMessage<T = unknown> {
  pattern: string;
  data: T;
  correlationId?: string;
}

// Brand/Entity ID Aliases
export type FileId = string;