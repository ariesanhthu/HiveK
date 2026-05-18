import type { KolVerificationCertificate } from "../types";

const NAME_POOL = [
  "Alex Rivers",
  "Mai Linh Tran",
  "Jordan Kim",
  "Sofia Nguyen",
  "Chris Patel",
  "Emma Vo",
  "Minh Quan Le",
  "Zara Hwang",
] as const;

const ROLE_POOL = [
  "Premium Content Creator",
  "Lifestyle & Brand Storyteller",
  "Tech Review Partner",
  "Beauty & Wellness KOL",
  "Gaming & Esports Creator",
] as const;

const QUOTE_PAIRS: ReadonlyArray<[string, string]> = [
  [
    "Exceptional conversion rates and flawless brand alignment across our last three launches.",
    "GLOBAL TECH PARTNER",
  ],
  [
    "Audience quality exceeded benchmarks; reporting was transparent and on schedule.",
    "RETAIL CO-PILOT GROUP",
  ],
  [
    "One of our most reliable creators for high-intent traffic and sustained engagement.",
    "LIFESTYLE MEDIA LAB",
  ],
];

function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

const KNOWN_SLUGS: Record<string, Partial<KolVerificationCertificate>> = {
  "alex-rivers": {
    displayName: "Alex Rivers",
    roleLabel: "Premium Content Creator",
    verificationId: "KOL-2024-889",
    issueDateLabel: "October 24, 2024",
    aggregateRating: 4.9,
    competencies: [
      { key: "authentic", title: "Authentic", subtext: "93.2% REACH" },
      { key: "impact", title: "Impact", subtext: "TOP 5% ENG." },
      { key: "history", title: "History", subtext: "3+ YEARS" },
    ],
    partnerFeedback: [
      {
        id: "fb-1",
        quote:
          "Exceptional conversion rates and flawless brand alignment across our last three launches.",
        partnerName: "GLOBAL TECH PARTNER",
        rating: "5.0",
      },
      {
        id: "fb-2",
        quote:
          "Consistent delivery, clear communication, and metrics we could trust week over week.",
        partnerName: "OMNI RETAIL CO.",
        rating: "4.9",
      },
    ],
  },
};

function pick<T extends readonly string[]>(pool: T, seed: number): T[number] {
  return pool[seed % pool.length];
}

function formatIssueDate(seed: number): string {
  const start = new Date(Date.UTC(2023, 0, 1));
  const dayOffset = seed % 700;
  const d = new Date(start.getTime() + dayOffset * 86400000);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function buildFromSlug(slug: string): KolVerificationCertificate {
  const h = djb2Hash(slug);
  const known = KNOWN_SLUGS[slug.toLowerCase()];
  const name =
    known?.displayName ?? pick(NAME_POOL, h);
  const role = known?.roleLabel ?? pick(ROLE_POOL, h >> 3);
  const verificationId =
    known?.verificationId ??
    `KOL-202${(h % 3) + 3}-${String(1000 + (h % 9000)).slice(1)}`;
  const issueDateLabel = known?.issueDateLabel ?? formatIssueDate(h);
  const ratingBase = known?.aggregateRating ?? 4 + (h % 10) / 10;
  const aggregateRating = Math.min(5, Math.round(ratingBase * 10) / 10);

  const reachPct = (88 + (h % 12)).toFixed(1);
  const engTier = ["TOP 3% ENG.", "TOP 5% ENG.", "TOP 8% ENG."][h % 3];
  const years = `${2 + (h % 4)}+ YEARS`;

  const competencies =
    known?.competencies ?? [
      { key: "authentic" as const, title: "Authentic", subtext: `${reachPct}% REACH` },
      { key: "impact" as const, title: "Impact", subtext: engTier },
      { key: "history" as const, title: "History", subtext: years },
    ];

  const checks: KolVerificationCertificate["checks"] = [
    { id: "kyc", label: "KYC Identity Verification", passed: true },
    { id: "api", label: "Social API Integration", passed: true },
    { id: "fraud", label: "Fraud Detection Matrix", passed: true },
    { id: "audience", label: "Audience Quality Audit", passed: true },
  ];

  const q0 = QUOTE_PAIRS[h % QUOTE_PAIRS.length];
  const q1 = QUOTE_PAIRS[(h >> 2) % QUOTE_PAIRS.length];
  const rA = Math.min(5, 4.6 + (h % 40) / 100);
  const rB = Math.min(5, 4.5 + ((h >> 3) % 45) / 100);
  const partnerFeedback =
    known?.partnerFeedback ?? [
      {
        id: "fb-a",
        quote: q0[0],
        partnerName: q0[1],
        rating: rA.toFixed(1),
      },
      {
        id: "fb-b",
        quote: q1[0],
        partnerName: q1[1],
        rating: rB.toFixed(1),
      },
    ];

  const signatureHash = Array.from({ length: 64 }, (_, i) => {
    const n = (h + i * 17) % 16;
    return n.toString(16);
  }).join("");

  const avatarSeed = encodeURIComponent(name);
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;

  return {
    slug,
    displayName: name,
    roleLabel: role,
    verificationId,
    issueDateLabel,
    aggregateRating,
    avatarUrl,
    competencies,
    checks,
    partnerFeedback,
    issuingAuthority: "KOL Verify Network Standards Board",
    digitalSignatureLabel: "Digital Signature Secured",
    signatureHash,
  };
}

/**
 * Resolves certificate payload for a public verification URL segment.
 * Replace with API / DB when backend exists.
 */
export function getCertificateById(id: string): KolVerificationCertificate {
  const slug = id.trim();
  if (!slug) {
    return buildFromSlug("unknown");
  }
  return buildFromSlug(slug);
}
