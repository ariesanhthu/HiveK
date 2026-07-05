import "server-only";

import { cookies } from "next/headers";
import { serverEnv } from "@/server/config/env";
import type { BackendEnvelope, BackendErrorPayload } from "@/server/backend/backend-types";

const ACCESS_COOKIE_NAME = "hivek_access_token";
const REFRESH_COOKIE_NAME = "hivek_refresh_token";

type QueryValue = string | number | boolean | null | undefined;

type BackendRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  authToken?: string | null;
  includeAuth?: boolean;
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  headers?: HeadersInit;
  query?: Record<string, QueryValue | QueryValue[]>;
};

export class BackendApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly code?: string;
  readonly payload?: unknown;

  constructor(input: {
    message: string;
    status: number;
    statusText: string;
    code?: string;
    payload?: unknown;
  }) {
    super(input.message);
    this.name = "BackendApiError";
    this.status = input.status;
    this.statusText = input.statusText;
    this.code = input.code;
    this.payload = input.payload;
  }
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

function appendQuery(url: URL, query?: BackendRequestOptions["query"]): void {
  if (!query) return;

  for (const [key, value] of Object.entries(query)) {
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (item === null || item === undefined || item === "") continue;
      url.searchParams.append(key, String(item));
    }
  }
}

function buildUrl(path: string, query?: BackendRequestOptions["query"]): string {
  const url = path.startsWith("http")
    ? new URL(path)
    : new URL(`${trimTrailingSlash(serverEnv.hivekBackendBaseUrl)}${normalizePath(path)}`);

  appendQuery(url, query);
  return url.toString();
}

function isJsonBody(body: BackendRequestOptions["body"]): body is Record<string, unknown> | unknown[] {
  if (!body) return false;
  if (typeof body !== "object") return false;
  if (body instanceof FormData) return false;
  if (body instanceof URLSearchParams) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  return true;
}

function getEnvelopeError(payload: unknown): BackendErrorPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const maybeEnvelope = payload as Partial<BackendEnvelope>;
  if (maybeEnvelope.error && typeof maybeEnvelope.error === "object") {
    return maybeEnvelope.error;
  }
  return null;
}

function getErrorMessage(payload: unknown, fallback: string): { message: string; code?: string } {
  const envelopeError = getEnvelopeError(payload);
  const rawMessage = envelopeError?.message;

  if (Array.isArray(rawMessage)) {
    return { message: rawMessage.join(", "), code: envelopeError?.code };
  }

  if (typeof rawMessage === "string" && rawMessage.trim()) {
    return { message: rawMessage, code: envelopeError?.code };
  }

  if (payload && typeof payload === "object") {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) {
      return { message: maybeMessage, code: envelopeError?.code };
    }
  }

  return { message: fallback, code: envelopeError?.code };
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getBackendAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE_NAME)?.value ?? null;
}

export async function setBackendAuthCookies(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  const cookieStore = await cookies();
  const secure = serverEnv.appEnv === "production" || process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  cookieStore.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearBackendAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);
  cookieStore.delete(REFRESH_COOKIE_NAME);
}

export async function backendRequestEnvelope<TData, TMeta = unknown>(
  path: string,
  options: BackendRequestOptions = {}
): Promise<BackendEnvelope<TData, TMeta>> {
  if (!serverEnv.hivekBackendApiKey) {
    throw new BackendApiError({
      message: "Missing HIVEK_BACKEND_API_KEY.",
      status: 0,
      statusText: "CONFIG_ERROR",
      code: "CONFIG_ERROR",
    });
  }

  const {
    authToken,
    body,
    headers: requestHeaders,
    includeAuth,
    query,
    ...fetchOptions
  } = options;

  const headers = new Headers(requestHeaders);
  headers.set("Accept", "application/json");
  headers.set("x-api-key", serverEnv.hivekBackendApiKey);

  const token =
    authToken ??
    (includeAuth ? await getBackendAccessToken() : null);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...fetchOptions,
    headers,
  };

  if (isJsonBody(body)) {
    headers.set("Content-Type", "application/json");
    requestInit.body = JSON.stringify(body);
  } else if (body) {
    requestInit.body = body;
  }

  const response = await fetch(buildUrl(path, query), requestInit);
  const payload = await parseResponsePayload(response);

  if (!response.ok) {
    const { message, code } = getErrorMessage(
      payload,
      `Backend request failed with ${response.status}`
    );

    throw new BackendApiError({
      message,
      status: response.status,
      statusText: response.statusText,
      code,
      payload,
    });
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as BackendEnvelope<TData, TMeta>;
    if (!envelope.success) {
      const { message, code } = getErrorMessage(payload, "Backend request failed");
      throw new BackendApiError({
        message,
        status: response.status,
        statusText: response.statusText,
        code,
        payload,
      });
    }
    return envelope;
  }

  return {
    success: true,
    data: payload as TData,
    error: null,
    meta: null,
  };
}

export async function backendRequest<TData>(
  path: string,
  options: BackendRequestOptions = {}
): Promise<TData> {
  const envelope = await backendRequestEnvelope<TData>(path, options);
  return envelope.data;
}

export function getBackendErrorMessage(error: unknown): string {
  if (error instanceof BackendApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Không thể kết nối backend.";
}
