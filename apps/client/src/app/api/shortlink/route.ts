/* ------------------------------------------------------------------ */
/*  GET /api/shortlink?productSlug=xxx&kolId=xxx                       */
/*  Returns the short code for a product+KOL pair.                     */
/* ------------------------------------------------------------------ */

import { NextResponse, type NextRequest } from "next/server";
import { getOrCreateShortCode } from "@/data/shortlinks";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const productSlug = searchParams.get("productSlug");
  const kolId = searchParams.get("kolId");

  if (!productSlug || !kolId) {
    return NextResponse.json(
      { error: "Thiếu tham số productSlug hoặc kolId." },
      { status: 400 }
    );
  }

  const code = getOrCreateShortCode(productSlug, kolId);

  return NextResponse.json({ code }, { status: 200 });
}
