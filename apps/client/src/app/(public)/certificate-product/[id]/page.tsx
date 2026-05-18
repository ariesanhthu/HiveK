"use client";

/* ------------------------------------------------------------------ */
/*  Certificate Product Page – Client Component                        */
/*  Displays product verification via KOL/KOC endorsement link.        */
/*  URL param [id] = "{productSlug}-{kolCode}"                         */
/* ------------------------------------------------------------------ */

import React from "react";
import { useParams } from "next/navigation";
import { useCertificateProduct } from "@/features/certificate-product/hooks/use-certificate-product";
import {
  VideoPlayer,
  ProductCard,
  KolInfoCard,
  KolReviewQuote,
  CommentSection,
  CertificatePageSkeleton,
} from "@/features/certificate-product/components";

export default function CertificateProductPage() {
  const params = useParams<{ id: string }>();
  const slug = params.id ?? "";
  const { data, isLoading, error } = useCertificateProduct(slug);

  /* ── Loading state ── */
  if (isLoading) {
    return <CertificatePageSkeleton />;
  }

  /* ── Error / 404 state ── */
  if (error || !data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="material-symbols-outlined text-5xl text-primary/40">
          error_outline
        </span>
        <h1 className="text-xl font-bold text-foreground">
          Không tìm thấy sản phẩm
        </h1>
        <p className="text-sm text-foreground-muted">
          {error ?? "Link không hợp lệ hoặc sản phẩm không tồn tại. Vui lòng kiểm tra lại link bạn nhận được."}
        </p>
        <a
          href="/"
          className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-background-dark shadow-primary transition-all hover:bg-primary/90"
        >
          Về trang chủ
        </a>
      </div>
    );
  }

  const { product, kol, comments, perks } = data;

  /* ── Main layout ── */
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Two-column grid: video+KOL left, product card right */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ─── Left Column ─── */}
        <div className="space-y-5">
          <VideoPlayer kol={kol} />
          <KolInfoCard kol={kol} />
          <KolReviewQuote quote={kol.reviewQuote} />
        </div>

        {/* ─── Right Column ─── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductCard product={product} perks={perks} />
        </div>
      </div>

      {/* ─── Full-width: Community Endorsements ─── */}
      <CommentSection comments={comments} />
    </div>
  );
}
