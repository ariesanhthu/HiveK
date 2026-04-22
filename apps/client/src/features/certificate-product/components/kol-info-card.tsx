import React from "react";
import type { CertificateKol } from "@/features/certificate-product/types";

type KolInfoCardProps = {
  kol: CertificateKol;
};

export const KolInfoCard: React.FC<KolInfoCardProps> = ({ kol }) => {
  return (
    <div className="rounded-2xl border border-primary-soft bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
          <img
            src={kol.avatarUrl}
            alt={kol.name}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Name & niche */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-bold text-foreground">
              {kol.name}
            </h3>
            {kol.isVerified && (
              <span
                className="material-symbols-outlined text-lg text-primary"
                title="Đã xác minh"
              >
                verified
              </span>
            )}
          </div>
          <p className="text-sm text-foreground-muted">{kol.niche}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-5">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-primary">
            star
          </span>
          <span className="text-sm font-bold text-foreground">
            {kol.rating.toFixed(1)}/5
          </span>
          <span className="text-xs text-foreground-muted">
            ({kol.ratingCount.toLocaleString("vi-VN")} đánh giá)
          </span>
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-primary-soft" />

        {/* Reach */}
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-success">
            groups
          </span>
          <span className="text-sm font-bold text-foreground">{kol.reach}</span>
          <span className="text-xs text-foreground-muted">Lượt tiếp cận</span>
        </div>
      </div>
    </div>
  );
};
