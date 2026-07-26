"use server";

import { revalidatePath } from "next/cache";
import {
  backendRequest,
  BackendApiError,
  getBackendErrorMessage,
} from "@/server/backend/backend-client";
import type {
  BackendSocialPage,
  BackendPlatform,
  BackendPlatformListData,
} from "@/server/backend/backend-types";

export type GetSocialPagesResult = {
  hasEnterprise: boolean;
  pages: BackendSocialPage[];
  error?: string;
};

export type OAuthUrlResult = {
  success: boolean;
  url?: string;
  message?: string;
};

export async function getConnectedSocialPages(): Promise<GetSocialPagesResult> {
  try {
    const pages = await backendRequest<BackendSocialPage[]>(
      "/client/v1/social-pages",
      {
        method: "GET",
        includeAuth: true,
        cache: "no-store",
      }
    );

    return {
      hasEnterprise: true,
      pages: Array.isArray(pages) ? pages : [],
    };
  } catch (err) {
    if (err instanceof BackendApiError && err.status === 403) {
      return {
        hasEnterprise: false,
        pages: [],
        error: "Chưa liên kết Hồ sơ Doanh nghiệp.",
      };
    }
    return {
      hasEnterprise: true,
      pages: [],
      error: getBackendErrorMessage(err),
    };
  }
}

export async function getFacebookOAuthUrl(): Promise<OAuthUrlResult> {
  try {
    const res = await backendRequest<{ url: string }>(
      "/client/v1/social-pages/facebook/oauth",
      {
        method: "GET",
        includeAuth: true,
        cache: "no-store",
      }
    );

    return { success: true, url: res.url };
  } catch (err) {
    return { success: false, message: getBackendErrorMessage(err) };
  }
}

export async function getThreadsOAuthUrl(): Promise<OAuthUrlResult> {
  try {
    const res = await backendRequest<{ url: string }>(
      "/client/v1/social-pages/threads/oauth",
      {
        method: "GET",
        includeAuth: true,
        cache: "no-store",
      }
    );

    return { success: true, url: res.url };
  } catch (err) {
    return { success: false, message: getBackendErrorMessage(err) };
  }
}

export async function disconnectSocialPage(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    await backendRequest<{ success: boolean }>(`/client/v1/social-pages/${id}`, {
      method: "DELETE",
      includeAuth: true,
      cache: "no-store",
    });

    revalidatePath("/settings/social-pages");
    return { success: true };
  } catch (err) {
    return { success: false, message: getBackendErrorMessage(err) };
  }
}

export async function getPlatforms(limit = 50): Promise<BackendPlatform[]> {
  try {
    const res = await backendRequest<BackendPlatformListData | BackendPlatform[]>(
      `/client/v1/platforms?limit=${limit}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (Array.isArray(res)) {
      return res;
    }
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch platforms:", getBackendErrorMessage(err));
    return [];
  }
}
