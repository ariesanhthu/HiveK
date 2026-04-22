/* ------------------------------------------------------------------ */
/*  Next.js Middleware – Short Link Redirect                           */
/*  Intercepts root-level short codes (e.g. /a1b2c3) and redirects     */
/*  to the full certificate-product page.                              */
/* ------------------------------------------------------------------ */

import { NextResponse, type NextRequest } from "next/server";
import { SHORTLINKS } from "@/data/shortlinks";

/**
 * Known route prefixes that should NOT be treated as short links.
 * Anything matching these passes through untouched.
 */
const KNOWN_PREFIXES = [
  "/api",
  "/auth",
  "/ambassador",
  "/campaigns",
  "/certificate-product",
  "/dashboard",
  "/kol-matching",
  "/kol-ranking",
  "/kol-verification",
  "/kol",
  "/_next",
  "/favicon",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip known routes and static assets
  if (
    pathname === "/" ||
    KNOWN_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract potential short code (strip leading /)
  const shortCode = pathname.slice(1);

  // Look up in the shortlinks table
  const shortLink = SHORTLINKS[shortCode];
  if (shortLink) {
    const url = request.nextUrl.clone();
    url.pathname = shortLink.target;
    return NextResponse.redirect(url, 307);
  }

  // Not a short link — pass through to normal routing (404, etc.)
  return NextResponse.next();
}

export const config = {
  /*
   * Match all root-level paths that could be short codes.
   * Excludes paths with nested segments or file extensions.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
