/* ------------------------------------------------------------------ */
/*  Certificate Product – Domain Types                                 */
/* ------------------------------------------------------------------ */

/** Product that a KOL/KOC is endorsing. */
export type CertificateProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  productPageUrl: string;
};

/** KOL/KOC who endorses the product. */
export type CertificateKol = {
  id: string;
  name: string;
  avatarUrl: string;
  niche: string;
  rating: number;
  ratingCount: number;
  reach: string;
  isVerified: boolean;
  reviewQuote: string;
  videoThumbnailUrl: string;
  videoEmbedUrl: string;
};

/** A single community comment / endorsement. */
export type CertificateComment = {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  createdAt: string; // ISO date
};

/** Perks / trust badges displayed next to the product card. */
export type CertificatePerk = {
  icon: string; // Material Symbols icon name
  label: string;
};

/** Combined API response for the certificate page. */
export type CertificateData = {
  product: CertificateProduct;
  kol: CertificateKol;
  comments: CertificateComment[];
  perks: CertificatePerk[];
};
