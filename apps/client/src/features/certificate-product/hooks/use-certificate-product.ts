"use client";

/* ------------------------------------------------------------------ */
/*  useCertificateProduct – Fetches data for the certificate page.     */
/*  Parses the URL slug into productCode + kolCode, then calls API.    */
/* ------------------------------------------------------------------ */

import { useEffect, useState } from "react";
import type { CertificateData } from "@/features/certificate-product/types";

/** Regex: everything before the last `-kol-XXX` is the product slug. */
const SLUG_RE = /^(.+)-(kol-\d{3})$/;

type UseCertificateProductReturn = {
  data: CertificateData | null;
  isLoading: boolean;
  error: string | null;
  productCode: string | null;
  kolCode: string | null;
};

export function parseCertificateSlug(slug: string) {
  const match = slug.match(SLUG_RE);
  if (!match) return null;
  return { productCode: match[1], kolCode: match[2] };
}

export function useCertificateProduct(
  slug: string
): UseCertificateProductReturn {
  const [data, setData] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsed = parseCertificateSlug(slug);
  const productCode = parsed?.productCode ?? null;
  const kolCode = parsed?.kolCode ?? null;

  useEffect(() => {
    if (!productCode || !kolCode) {
      setError("Link không hợp lệ. Vui lòng kiểm tra lại.");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/certificate-product?productCode=${encodeURIComponent(productCode)}&kolCode=${encodeURIComponent(kolCode)}`
        );

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ??
              "Không thể tải thông tin sản phẩm."
          );
        }

        const json = (await res.json()) as CertificateData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Đã có lỗi xảy ra. Vui lòng thử lại."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [productCode, kolCode]);

  return { data, isLoading, error, productCode, kolCode };
}
