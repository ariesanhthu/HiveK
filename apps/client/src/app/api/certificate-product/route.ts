/* ------------------------------------------------------------------ */
/*  GET /api/certificate-product?productCode=xxx&kolCode=xxx           */
/*  Returns CertificateData JSON or 404.                               */
/* ------------------------------------------------------------------ */

import { NextResponse, type NextRequest } from "next/server";
import {
  CERTIFICATE_PRODUCTS,
  CERTIFICATE_KOLS,
  CERTIFICATE_COMMENTS,
  CERTIFICATE_PERKS,
} from "@/data/certificate-product";
import type { CertificateData } from "@/features/certificate-product/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const productCode = searchParams.get("productCode");
  const kolCode = searchParams.get("kolCode");

  if (!productCode || !kolCode) {
    return NextResponse.json(
      { error: "Thiếu tham số productCode hoặc kolCode." },
      { status: 400 }
    );
  }

  const product = CERTIFICATE_PRODUCTS[productCode];
  const kol = CERTIFICATE_KOLS[kolCode];

  if (!product || !kol) {
    return NextResponse.json(
      { error: "Không tìm thấy sản phẩm hoặc KOL/KOC." },
      { status: 404 }
    );
  }

  const data: CertificateData = {
    product,
    kol,
    comments: CERTIFICATE_COMMENTS,
    perks: CERTIFICATE_PERKS,
  };

  return NextResponse.json(data, { status: 200 });
}
