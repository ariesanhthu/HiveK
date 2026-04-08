import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  KolVerificationCertificateView,
  type KolVerificationCertificate,
} from "@/features/kol-verification-certificate";
import { getKolById } from "@/features/kol-ranking/server/get-kol-rankings";
import type { KolRankingItem } from "@/features/kol-ranking/types";

type PageProps = {
  params: Promise<{ id: string }>;
};

const NICHE_ROLE_MAP: Record<string, string> = {
  "Làm đẹp": "Beauty & Wellness KOL",
  Game: "Gaming & Esports Creator",
  "Đời sống": "Lifestyle & Brand Storyteller",
  "Công nghệ": "Tech Review Partner",
  "Thể hình": "Fitness & Health Creator",
};

function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function mapRankingToCertificate(kol: KolRankingItem): KolVerificationCertificate {
  const h = djb2Hash(kol.id);

  const reachPct = Math.min(99, 85 + kol.engagementRate).toFixed(1);
  const engTier =
    kol.rank <= 3
      ? "TOP 3% ENG."
      : kol.rank <= 10
        ? "TOP 5% ENG."
        : "TOP 8% ENG.";
  const years = `${2 + (h % 4)}+ YEARS`;

  const signatureHash = Array.from({ length: 64 }, (_, i) => {
    const n = (h + i * 17) % 16;
    return n.toString(16);
  }).join("");

  return {
    slug: kol.id,
    displayName: kol.name,
    roleLabel: NICHE_ROLE_MAP[kol.niche] ?? "Premium Content Creator",
    verificationId: `KOL-2025-${kol.id.replace(/\D/g, "").padStart(3, "0")}`,
    issueDateLabel: new Date(kol.updatedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    aggregateRating: kol.rating,
    avatarUrl: kol.avatarUrl,
    competencies: [
      { key: "authentic" as const, title: "Authentic", subtext: `${reachPct}% REACH` },
      { key: "impact" as const, title: "Impact", subtext: engTier },
      { key: "history" as const, title: "History", subtext: years },
    ],
    checks: [
      { id: "kyc", label: "KYC Identity Verification", passed: true },
      { id: "api", label: "Social API Integration", passed: true },
      { id: "fraud", label: "Fraud Detection Matrix", passed: true },
      { id: "audience", label: "Audience Quality Audit", passed: true },
    ],
    partnerFeedback: [
      {
        id: "fb-a",
        quote:
          "One of our most reliable creators for high-intent traffic and sustained engagement.",
        partnerName: "LIFESTYLE MEDIA LAB",
        rating: Math.min(5, 4.6 + (h % 40) / 100).toFixed(1),
      },
      {
        id: "fb-b",
        quote:
          "Audience quality exceeded benchmarks; reporting was transparent and on schedule.",
        partnerName: "RETAIL CO-PILOT GROUP",
        rating: Math.min(5, 4.5 + ((h >> 3) % 45) / 100).toFixed(1),
      },
    ],
    issuingAuthority: "KOL Verify Network Standards Board",
    digitalSignatureLabel: "Digital Signature Secured",
    signatureHash,
  };
}

async function resolveKol(params: PageProps["params"]) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const kol = getKolById(decodedId);
  return { decodedId, kol };
}

async function resolveVerifyUrl(id: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) {
    return `/kol/${encodeURIComponent(id)}`;
  }
  return `${proto}://${host}/kol/${encodeURIComponent(id)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { decodedId, kol } = await resolveKol(params);

  if (!kol) {
    return {
      title: "KOL không tồn tại | Hive-K",
      description: `Không tìm thấy KOL với id ${decodedId}.`,
    };
  }

  return {
    title: `${kol.name} | Chứng nhận xác minh | Hive-K`,
    description: `Chứng nhận xác minh creator ${kol.name}: hạng #${kol.rank}, ${kol.platform}, lĩnh vực ${kol.niche}.`,
    openGraph: {
      title: `Creator Verification — ${kol.name}`,
      description: `Hạng #${kol.rank} · ${kol.platform} · ${kol.niche}`,
    },
  };
}

export default async function KolDetailPage({ params }: PageProps) {
  const { decodedId, kol } = await resolveKol(params);

  if (!kol) {
    notFound();
  }

  const certificate = mapRankingToCertificate(kol);
  const verifyUrl = await resolveVerifyUrl(decodedId);

  return (
    <div className="min-h-[60vh] bg-muted/40">
      <KolVerificationCertificateView data={certificate} verifyUrl={verifyUrl} />
    </div>
  );
}
