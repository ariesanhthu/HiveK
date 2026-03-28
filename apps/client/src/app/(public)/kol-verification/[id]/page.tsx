import type { Metadata } from "next";
import { headers } from "next/headers";
import {
  getCertificateById,
  KolVerificationCertificateView,
} from "@/features/kol-verification-certificate";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function resolveVerifyUrl(id: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) {
    return `/kol-verification/${encodeURIComponent(id)}`;
  }
  return `${proto}://${host}/kol-verification/${encodeURIComponent(id)}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const data = getCertificateById(decodeURIComponent(id));
  return {
    title: `${data.displayName} | Chứng nhận xác minh | KOLConnect`,
    description:
      "Chứng nhận xác minh creator: metrics, kiểm tra hệ thống và phản hồi đối tác đã xác minh.",
    openGraph: {
      title: `Creator Verification — ${data.displayName}`,
      description: `Verification ID ${data.verificationId}`,
    },
  };
}

export default async function KolVerificationCertificatePage({
  params,
}: PageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const data = getCertificateById(decoded);
  const verifyUrl = await resolveVerifyUrl(decoded);

  return (
    <div className="min-h-[60vh] bg-muted/40">
      <KolVerificationCertificateView data={data} verifyUrl={verifyUrl} />
    </div>
  );
}
