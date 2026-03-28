"use client";

import {
  Download,
  Link2,
  Loader2,
  Share2,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

type CertificateActionBarProps = {
  verifyUrl: string;
  displayName: string;
};

export function CertificateActionBar({
  verifyUrl,
  displayName,
}: CertificateActionBarProps) {
  const [busy, setBusy] = React.useState<"pdf" | "share" | "link" | null>(
    null
  );

  const handlePrintPdf = () => {
    setBusy("pdf");
    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      document.body.removeAttribute("data-print-certificate");
      window.removeEventListener("afterprint", cleanup);
      setBusy(null);
    };
    document.body.dataset.printCertificate = "1";
    window.addEventListener("afterprint", cleanup);
    requestAnimationFrame(() => {
      window.print();
    });
    window.setTimeout(cleanup, 2500);
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${displayName} — Creator Verification`,
          text: "Xem chứng nhận xác minh creator trên KOLConnect.",
          url: verifyUrl,
        });
      } else {
        await navigator.clipboard.writeText(verifyUrl);
      }
    } catch {
      /* user cancelled or clipboard blocked */
    } finally {
      setBusy(null);
    }
  };

  const handleCopyLink = async () => {
    setBusy("link");
    try {
      await navigator.clipboard.writeText(verifyUrl);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center print:hidden"
      data-certificate-actions
    >
      <button
        type="button"
        onClick={handlePrintPdf}
        disabled={busy !== null}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background-light transition-opacity hover:opacity-90 disabled:opacity-60"
        )}
      >
        {busy === "pdf" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Download className="h-4 w-4" aria-hidden />
        )}
        Download PDF
      </button>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy !== null}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-soft bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        {busy === "share" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden />
        )}
        Share
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        disabled={busy !== null}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-soft bg-card px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
      >
        {busy === "link" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Link2 className="h-4 w-4" aria-hidden />
        )}
        Verify Link
      </button>
    </div>
  );
}
