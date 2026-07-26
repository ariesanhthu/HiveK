"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BackendEnterpriseProfile } from "@/server/backend/backend-types";

type EnterpriseProfileViewProps = {
  enterprises: BackendEnterpriseProfile[];
};

export function EnterpriseProfileView({ enterprises }: EnterpriseProfileViewProps) {
  const [selectedId, setSelectedId] = useState<string>(
    enterprises[0]?.id || ""
  );

  const activeEnterprise =
    enterprises.find((e) => e.id === selectedId) || enterprises[0] || null;

  if (!activeEnterprise) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center text-amber-200">
        <span className="material-symbols-outlined text-4xl text-amber-400">
          business_center
        </span>
        <h3 className="mt-2 text-lg font-bold text-white">Chưa có Hồ sơ Doanh nghiệp nào</h3>
        <p className="mt-1 text-sm text-amber-200/80">
          Bạn chưa tạo Hồ sơ Doanh nghiệp. Hãy khởi tạo doanh nghiệp đầu tiên của bạn để mở khóa workspace.
        </p>
        <Link
          href="/enterprise/setup"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-background-dark shadow-md hover:bg-amber-300"
        >
          <span className="material-symbols-outlined text-base">add_business</span>
          Tạo Hồ sơ Doanh nghiệp
        </Link>
      </div>
    );
  }

  const initialLetter = activeEnterprise.companyName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Multiple Enterprise Selector Tabs */}
      {enterprises.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary-soft bg-card p-2">
          <span className="px-2 text-xs font-bold text-foreground-muted">Chọn Doanh nghiệp:</span>
          {enterprises.map((ent) => {
            const isSelected = ent.id === activeEnterprise.id;
            return (
              <button
                key={ent.id}
                type="button"
                onClick={() => setSelectedId(ent.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-primary text-background-dark shadow-sm"
                    : "bg-primary-soft/50 text-foreground-muted hover:bg-primary-soft hover:text-foreground"
                }`}
              >
                {ent.companyName}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* Main Enterprise Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-soft bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-black text-background-dark shadow-md">
              {initialLetter}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold text-foreground">
                  {activeEnterprise.companyName}
                </h2>
                {activeEnterprise.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Đã xác minh
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    Chờ xác minh
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                Mã định danh ID: <code className="font-mono text-primary">{activeEnterprise.id}</code>
                {activeEnterprise.createdAt ? (
                  <span> • Khởi tạo: {new Date(activeEnterprise.createdAt).toLocaleDateString("vi-VN")}</span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/settings/social-pages"
              className="flex items-center gap-1.5 rounded-xl border border-primary-soft bg-background-light px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-primary-soft"
            >
              <span className="material-symbols-outlined text-base text-primary">share</span>
              Liên kết MXH
            </Link>
            <Link
              href="/enterprise/setup"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-background-dark shadow-md hover:bg-primary/90"
            >
              <span className="material-symbols-outlined text-base">add_business</span>
              Thêm Doanh nghiệp
            </Link>
          </div>
        </div>
      </div>

      {/* Grid Layout: Details & Knowledge Base */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: General Info & Knowledge Base */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Information Card */}
          <div className="rounded-2xl border border-primary-soft bg-card p-6 space-y-5">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              Thông tin chung Doanh nghiệp
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground-muted block mb-1">Mô tả hoạt động</label>
              <p className="rounded-xl border border-primary-soft/60 bg-background-light p-3.5 text-sm text-foreground leading-relaxed whitespace-pre-line">
                {activeEnterprise.description || "Chưa có mô tả chi tiết."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-primary-soft/60 bg-background-light p-3.5">
                <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">alternate_email</span>
                  Email liên hệ
                </span>
                <p className="mt-1 font-bold text-sm text-foreground truncate">
                  {activeEnterprise.contactEmail}
                </p>
              </div>

              <div className="rounded-xl border border-primary-soft/60 bg-background-light p-3.5">
                <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">phone</span>
                  Số điện thoại
                </span>
                <p className="mt-1 font-bold text-sm text-foreground truncate">
                  {activeEnterprise.contactPhone}
                </p>
              </div>

              <div className="rounded-xl border border-primary-soft/60 bg-background-light p-3.5">
                <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">language</span>
                  Website
                </span>
                {activeEnterprise.website ? (
                  <a
                    href={activeEnterprise.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 font-bold text-sm text-primary hover:underline block truncate"
                  >
                    {activeEnterprise.website}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-foreground-muted italic">Chưa cập nhật</p>
                )}
              </div>

              <div className="rounded-xl border border-primary-soft/60 bg-background-light p-3.5">
                <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  Mã số thuế (Tax ID)
                </span>
                <p className="mt-1 font-bold text-sm text-foreground font-mono truncate">
                  {activeEnterprise.taxId || "Chưa cập nhật"}
                </p>
              </div>
            </div>
          </div>

          {/* Knowledge Base Card */}
          <div className="rounded-2xl border border-primary-soft bg-card p-6 space-y-4">
            <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
              <span className="material-symbols-outlined text-primary text-xl">menu_book</span>
              Cơ sở trí tuệ & Tri thức (Knowledge Base)
            </h3>

            {activeEnterprise.knowledgeBase ? (
              <div className="space-y-3">
                {activeEnterprise.knowledgeBase.rawText ? (
                  <div className="rounded-xl border border-primary-soft/60 bg-background-light p-3.5 text-xs text-foreground leading-relaxed">
                    {activeEnterprise.knowledgeBase.rawText}
                  </div>
                ) : null}

                {activeEnterprise.knowledgeBase.externalLinks &&
                activeEnterprise.knowledgeBase.externalLinks.length > 0 ? (
                  <div>
                    <span className="text-xs font-semibold text-foreground-muted block mb-1.5">Liên kết tài liệu:</span>
                    <div className="flex flex-wrap gap-2">
                      {activeEnterprise.knowledgeBase.externalLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-primary-soft bg-background-light px-2.5 py-1 text-xs text-primary hover:underline"
                        >
                          <span className="material-symbols-outlined text-xs">link</span>
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-xs text-foreground-muted italic">
                Doanh nghiệp chưa khởi tạo dữ liệu tri thức bổ sung.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Members & Quick Navigation */}
        <div className="space-y-6">
          {/* Team Members Card */}
          <div className="rounded-2xl border border-primary-soft bg-card p-6 space-y-4">
            <h3 className="flex items-center justify-between text-base font-bold text-foreground">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">group</span>
                Thành viên ({activeEnterprise.members?.length || 1})
              </span>
            </h3>

            <div className="space-y-2">
              {(activeEnterprise.members || [{ userId: activeEnterprise.userId, mode: "owner" }]).map(
                (member, idx) => {
                  const isOwner = member.mode === "owner";
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-xl border border-primary-soft/60 bg-background-light p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary">
                          <span className="material-symbols-outlined text-base">person</span>
                        </div>
                        <span className="font-mono text-foreground truncate">
                          {member.userId}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isOwner
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {isOwner ? "Chủ sở hữu" : "Thành viên"}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Connected Quick Actions */}
          <div className="rounded-2xl border border-primary-soft bg-card p-6 space-y-3">
            <h3 className="text-base font-bold text-foreground mb-1">Cài đặt liên quan</h3>
            
            <Link
              href="/settings/social-pages"
              className="flex items-center justify-between rounded-xl border border-primary-soft bg-background-light p-3 text-xs font-bold text-foreground transition-colors hover:bg-primary-soft"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">share</span>
                Liên kết Mạng xã hội
              </span>
              <span className="material-symbols-outlined text-base text-foreground-muted">chevron_right</span>
            </Link>

            <Link
              href="/enterprise/setup"
              className="flex items-center justify-between rounded-xl border border-primary-soft bg-background-light p-3 text-xs font-bold text-foreground transition-colors hover:bg-primary-soft"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_business</span>
                Khởi tạo Doanh nghiệp mới
              </span>
              <span className="material-symbols-outlined text-base text-foreground-muted">chevron_right</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
