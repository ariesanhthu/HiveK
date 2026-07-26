"use server";

import { redirect } from "next/navigation";
import { backendRequest, getBackendErrorMessage } from "@/server/backend/backend-client";
import type { BackendEnterpriseProfile, BackendEnterpriseMeData } from "@/server/backend/backend-types";

export type EnterpriseFormState = {
  ok: boolean;
  fieldErrors: Record<string, string>;
  message: string;
};

const INITIAL_STATE: EnterpriseFormState = {
  ok: false,
  fieldErrors: {},
  message: "",
};

function readString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Fetch all enterprises associated with the current logged in user */
export async function getMyEnterprises(): Promise<BackendEnterpriseProfile[]> {
  try {
    const res = await backendRequest<BackendEnterpriseMeData | BackendEnterpriseProfile[]>(
      "/client/v1/enterprises/me",
      {
        method: "GET",
        includeAuth: true,
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
    console.error("Failed to fetch my enterprises:", getBackendErrorMessage(err));
    return [];
  }
}

/** Create a new Enterprise Profile */
export async function createEnterpriseProfile(
  _prev: EnterpriseFormState,
  formData: FormData
): Promise<EnterpriseFormState> {
  const companyName = readString(formData, "companyName");
  const description = readString(formData, "description");
  const contactEmail = readString(formData, "contactEmail");
  const contactPhone = readString(formData, "contactPhone");
  const websiteRaw = readString(formData, "website");
  const taxIdRaw = readString(formData, "taxId");

  const fieldErrors: Record<string, string> = {};

  if (!companyName) {
    fieldErrors.companyName = "Tên công ty là bắt buộc.";
  }
  if (!description) {
    fieldErrors.description = "Mô tả công ty là bắt buộc.";
  }
  if (!contactEmail || !contactEmail.includes("@")) {
    fieldErrors.contactEmail = "Email liên hệ không hợp lệ.";
  }
  if (!contactPhone) {
    fieldErrors.contactPhone = "Số điện thoại liên hệ là bắt buộc.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors, message: "" };
  }

  const website = websiteRaw.length > 0 ? websiteRaw : undefined;
  const taxId = taxIdRaw.length > 0 ? taxIdRaw : undefined;

  try {
    await backendRequest<BackendEnterpriseProfile>("/client/v1/enterprises", {
      method: "POST",
      includeAuth: true,
      body: {
        companyName,
        description,
        contactEmail,
        contactPhone,
        website,
        taxId,
      },
      cache: "no-store",
    });
  } catch (error) {
    return {
      ...INITIAL_STATE,
      ok: false,
      message: `Khởi tạo hồ sơ Doanh nghiệp thất bại: ${getBackendErrorMessage(error)}`,
    };
  }

  redirect("/dashboard");
}
