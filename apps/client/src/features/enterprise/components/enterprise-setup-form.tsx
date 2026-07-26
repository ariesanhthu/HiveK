"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { AccentWord, AuthShell } from "@/features/auth/components/auth-shell";
import { AuthField } from "@/features/auth/components/auth-field";
import {
  createEnterpriseProfile,
  type EnterpriseFormState,
} from "@/features/enterprise/server/enterprise-actions";

const INITIAL: EnterpriseFormState = {
  ok: false,
  fieldErrors: {},
  message: "",
};

const ACCENT = "var(--color-primary)";

export function EnterpriseSetupForm() {
  const [state, formAction, isPending] = useActionState(
    createEnterpriseProfile,
    INITIAL
  );

  return (
    <AuthShell
      className="max-w-xl"
      accent={{
        color: ACCENT,
        chipIcon: "business",
        chipLabel: "Thiết lập Hồ sơ Doanh nghiệp",
      }}
      heading={
        <>
          Khởi tạo <AccentWord color={ACCENT}>Doanh nghiệp</AccentWord>
        </>
      }
      subtitle="Hoàn tất thông tin doanh nghiệp để mở khóa toàn bộ tính năng vận hành chiến dịch và kết nối CTV."
    >
      <form action={formAction} className="space-y-5" noValidate>
        <AuthField
          id="companyName"
          name="companyName"
          label="Tên công ty / Doanh nghiệp"
          icon="domain"
          placeholder="Ví dụ: Công ty TNHH Acme Vietnam"
          error={state.fieldErrors.companyName}
        />

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-xs font-bold text-white/80">
            Mô tả doanh nghiệp <span className="text-primary">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Giới thiệu ngắn về lĩnh vực hoạt động, sản phẩm chính và mục tiêu tiếp thị..."
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/30 transition-colors focus:border-primary focus:outline-none"
          />
          {state.fieldErrors.description ? (
            <p className="text-xs text-red-400">{state.fieldErrors.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthField
            id="contactEmail"
            name="contactEmail"
            type="email"
            label="Email liên hệ"
            icon="alternate_email"
            placeholder="contact@acme.com"
            error={state.fieldErrors.contactEmail}
          />

          <AuthField
            id="contactPhone"
            name="contactPhone"
            type="tel"
            label="Số điện thoại liên hệ"
            icon="phone"
            placeholder="+84901234567"
            error={state.fieldErrors.contactPhone}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AuthField
            id="website"
            name="website"
            type="url"
            label="Website (Không bắt buộc)"
            icon="language"
            placeholder="https://acme.com"
            error={state.fieldErrors.website}
          />

          <AuthField
            id="taxId"
            name="taxId"
            label="Mã số thuế (Không bắt buộc)"
            icon="receipt_long"
            placeholder="0109998887"
            error={state.fieldErrors.taxId}
          />
        </div>

        {state.message ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300"
          >
            <span className="material-symbols-outlined mt-0.5 text-base" aria-hidden>
              warning
            </span>
            {state.message}
          </p>
        ) : null}

        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={{ scale: isPending ? 1 : 1.02 }}
          whileTap={{ scale: isPending ? 1 : 0.97 }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-background-dark shadow-primary transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined animate-spin text-lg" aria-hidden>
                progress_activity
              </span>
              Đang khởi tạo doanh nghiệp...
            </>
          ) : (
            <>
              Hoàn tất & Vào Dashboard
              <span className="material-symbols-outlined text-lg" aria-hidden>
                arrow_forward
              </span>
            </>
          )}
        </motion.button>
      </form>
    </AuthShell>
  );
}
