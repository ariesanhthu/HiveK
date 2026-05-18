import {
  BadgeCheck,
  CheckCircle2,
  History,
  Quote,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KolVerificationCertificate } from "../types";
import { CertificateActionBar } from "./certificate-action-bar";

type KolVerificationCertificateViewProps = {
  data: KolVerificationCertificate;
  verifyUrl: string;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${rating} of 5`}>
      {Array.from({ length: 5 }, (_, i) => {
        const isFull = i < Math.floor(rating);
        const isPartial =
          !isFull && i === Math.floor(rating) && rating % 1 >= 0.25;
        return (
          <Star
            key={i}
            className={cn(
              "h-4 w-4 text-amber-400",
              isFull && "fill-amber-400",
              isPartial && "fill-amber-400/60"
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function CompetencyIcon({ keyName }: { keyName: string }) {
  const common = "h-5 w-5 shrink-0";
  if (keyName === "authentic") {
    return <Shield className={cn(common, "text-[var(--color-primary)]")} />;
  }
  if (keyName === "impact") {
    return <Sparkles className={cn(common, "text-[var(--color-tech-blue)]")} />;
  }
  return <History className={cn(common, "text-[var(--color-creator-purple)]")} />;
}

export function KolVerificationCertificateView({
  data,
  verifyUrl,
}: KolVerificationCertificateViewProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <Card className="overflow-hidden border-primary-soft shadow-lg shadow-foreground/5">
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-creator-purple), var(--color-tech-blue))",
          }}
          aria-hidden
        />

        <div className="space-y-10 p-6 md:p-10">
          <header className="space-y-4 text-center">
            <div className="flex justify-center">
              <Badge
                variant="warning"
                className="rounded-full border-0 bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
              >
                ✓ Verified Credential
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Creator Verification Certificate
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-foreground-muted md:text-base">
              This document validates authenticity, performance metrics, and
              verified track record for the creator profile below.
            </p>
          </header>

          <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-primary-soft bg-muted sm:h-28 sm:w-28">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote DiceBear SVG, no image optimizer domain */}
                  <img
                    src={data.avatarUrl}
                    alt=""
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md ring-2 ring-card"
                  title="Verified"
                >
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                </span>
              </div>
              <div className="min-w-0 space-y-2">
                <h2 className="text-xl font-bold text-foreground md:text-2xl">
                  {data.displayName}
                </h2>
                <p className="text-sm font-semibold text-[var(--color-creator-purple)] md:text-base">
                  {data.roleLabel}
                </p>
                <dl className="grid gap-1 text-xs text-foreground-muted sm:grid-cols-2 sm:gap-x-6">
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Verification ID
                    </dt>
                    <dd className="font-mono text-foreground">
                      {data.verificationId}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-wider text-muted-foreground">
                      Issue date
                    </dt>
                    <dd className="text-foreground">{data.issueDateLabel}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="rounded-xl border border-primary-soft bg-muted/80 px-5 py-4 text-center lg:min-w-[180px]">
              <p className="text-2xl font-bold text-foreground md:text-3xl">
                {data.aggregateRating.toFixed(1)}
                <span className="text-base font-semibold text-foreground-muted">
                  /5
                </span>
              </p>
              <div className="mt-2 flex justify-center">
                <StarRow rating={data.aggregateRating} />
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-widest text-foreground-muted">
                Aggregate performance rating
              </p>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted">
                Verified competencies
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {data.competencies.map((c) => (
                  <Card
                    key={c.key}
                    className="border-primary-soft bg-card p-3 shadow-none"
                  >
                    <CompetencyIcon keyName={c.key} />
                    <p className="mt-2 text-sm font-bold text-foreground">
                      {c.title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-foreground-muted">
                      {c.subtext}
                    </p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted">
                Verification checks
              </h3>
              <ul className="space-y-3">
                {data.checks.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-success"
                      aria-hidden
                    />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground-muted">
              Verified partner feedback
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {data.partnerFeedback.map((fb) => (
                <Card
                  key={fb.id}
                  className="relative border-primary-soft bg-card p-5 shadow-sm"
                >
                  <Quote
                    className="mb-3 h-8 w-8 text-primary/30"
                    aria-hidden
                  />
                  <blockquote className="text-sm leading-relaxed text-foreground">
                    “{fb.quote}”
                  </blockquote>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-primary-soft pt-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-foreground-muted">
                      {fb.partnerName}
                    </span>
                    <span className="rounded-md border border-primary px-2 py-0.5 text-xs font-bold text-primary">
                      {fb.rating}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <footer className="flex flex-col gap-6 border-t border-primary-soft pt-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary-soft bg-muted text-foreground-muted"
                aria-hidden
              >
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
                  Issuing authority
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {data.issuingAuthority}
                </p>
              </div>
            </div>
            <div className="text-right md:max-w-md">
              <p className="text-sm italic text-foreground-muted">
                {data.digitalSignatureLabel}
              </p>
              <p className="mt-1 break-all font-mono text-[11px] text-foreground-muted">
                {data.signatureHash}
              </p>
            </div>
          </footer>
        </div>
      </Card>

      <CertificateActionBar verifyUrl={verifyUrl} displayName={data.displayName} />
    </div>
  );
}
