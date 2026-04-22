/* ------------------------------------------------------------------ */
/*  Short Link Registry (Mock)                                         */
/*  Maps short codes → full certificate-product paths.                 */
/*  In production this would be a DB table.                            */
/* ------------------------------------------------------------------ */

export interface ShortLink {
  code: string;
  /** Full path (without origin), e.g. "/certificate-product/..." */
  target: string;
  /** Metadata for lookup */
  productSlug: string;
  kolId: string;
}

/**
 * Generate a deterministic 6-char alphanumeric code from a slug.
 * Uses a simple hash — not cryptographic, just for short URLs.
 */
export function generateShortCode(productSlug: string, kolId: string): string {
  const input = `${productSlug}::${kolId}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Convert to base-36, take 6 chars, ensure no leading dash
  return Math.abs(hash).toString(36).slice(0, 6).padEnd(6, "0");
}

/* ───────── Pre-generated short link table ───────── */

const ENTRIES: Array<{ productSlug: string; kolId: string }> = [
  // Product × KOL combinations that exist in mock data
  { productSlug: "nike-future-speed-run", kolId: "kol-001" },
  { productSlug: "nike-future-speed-run", kolId: "kol-004" },
  { productSlug: "nike-future-speed-run", kolId: "kol-008" },
  { productSlug: "nike-future-speed-run", kolId: "kol-009" },
  { productSlug: "summer-glow-skincare", kolId: "kol-003" },
  { productSlug: "summer-glow-skincare", kolId: "kol-005" },
  { productSlug: "summer-glow-skincare", kolId: "kol-006" },
  { productSlug: "soundmaster-pro-review", kolId: "kol-002" },
  { productSlug: "soundmaster-pro-review", kolId: "kol-007" },
  { productSlug: "elite-chrono-collection", kolId: "kol-006" },
  { productSlug: "elite-chrono-collection", kolId: "kol-010" },
  { productSlug: "barista-series-home-hub", kolId: "kol-003" },
  { productSlug: "barista-series-home-hub", kolId: "kol-004" },
];

/** code → ShortLink */
export const SHORTLINKS: Record<string, ShortLink> = {};

/** Reverse lookup: "productSlug::kolId" → code */
export const SHORTLINK_REVERSE: Record<string, string> = {};

for (const { productSlug, kolId } of ENTRIES) {
  const code = generateShortCode(productSlug, kolId);
  const target = `/certificate-product/${productSlug}-${kolId}`;
  SHORTLINKS[code] = { code, target, productSlug, kolId };
  SHORTLINK_REVERSE[`${productSlug}::${kolId}`] = code;
}

/**
 * Look up or create a short code for a product+KOL pair.
 * In production: DB upsert. Here: deterministic generation.
 */
export function getOrCreateShortCode(
  productSlug: string,
  kolId: string
): string {
  const key = `${productSlug}::${kolId}`;
  if (SHORTLINK_REVERSE[key]) return SHORTLINK_REVERSE[key];

  // Generate on the fly for unknown combos
  const code = generateShortCode(productSlug, kolId);
  const target = `/certificate-product/${productSlug}-${kolId}`;
  SHORTLINKS[code] = { code, target, productSlug, kolId };
  SHORTLINK_REVERSE[key] = code;
  return code;
}
