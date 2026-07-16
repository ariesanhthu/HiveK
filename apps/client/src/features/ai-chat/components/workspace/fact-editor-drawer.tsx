"use client";

import { useEffect, useId, useState } from "react";
import { ExternalLink, FileText, ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type {
  BrandFact,
  BrandFactPatch,
} from "@/features/ai-chat/types/workspace-types";
import { useDrawerDialog } from "./use-drawer-dialog";

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
});

type FactEditorDrawerProps = {
  fact: BrandFact | null;
  onClose: () => void;
  onUpdate: (factId: string, patch: BrandFactPatch) => void;
  onConfirm: (factId: string) => void;
};

export function FactEditorDrawer({
  fact,
  onClose,
  onUpdate,
  onConfirm,
}: FactEditorDrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [value, setValue] = useState("");
  const [savedValue, setSavedValue] = useState("");

  useEffect(() => {
    const nextValue = fact?.value ?? "";
    setValue(nextValue);
    setSavedValue(nextValue);
  }, [fact?.id, fact?.value]);

  const hasChanged = value.trim() !== savedValue.trim();
  const { dialogRef, requestClose } = useDrawerDialog({
    isOpen: Boolean(fact),
    hasUnsavedChanges: hasChanged,
    onClose,
  });

  if (!fact) return null;

  const activeFact = fact;

  function saveValue(): void {
    const nextValue = value.trim();
    if (!nextValue) return;
    onUpdate(activeFact.id, { value: nextValue });
    setSavedValue(nextValue);
  }

  function saveAndConfirm(): void {
    const nextValue = value.trim();
    if (!nextValue) return;
    if (hasChanged) onUpdate(activeFact.id, { value: nextValue });
    onConfirm(activeFact.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
        onClick={requestClose}
        aria-label="Đóng trình chỉnh sửa dữ kiện"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-lg flex-col overflow-hidden border-l border-slate-200 bg-card shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-amber-700">
              Dữ kiện thương hiệu
            </p>
            <h2 id={titleId} className="mt-1 text-lg font-extrabold text-foreground">
              {fact.label}
            </h2>
            <p id={descriptionId} className="mt-1 text-xs leading-5 text-foreground-muted">
              Chỉnh giá trị nếu cần, kiểm tra nguồn rồi xác nhận để dùng trong nội dung.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={requestClose} aria-label="Đóng">
            <X className="size-4" aria-hidden />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant={fact.status === "confirmed" ? "success" : "warning"}>
              {fact.status === "confirmed" ? "Đã xác nhận" : "Cần xác nhận"}
            </Badge>
            <Badge variant="secondary">
              Độ tin cậy {Math.round(fact.confidence * 100)}%
            </Badge>
            <Badge variant="outline">
              {fact.dataQuality === "verified"
                ? "Đã đối chiếu"
                : fact.dataQuality === "user_provided"
                  ? "Người dùng cung cấp"
                  : "Ước tính"}
            </Badge>
          </div>

          <div className="mt-5">
            <Label htmlFor="brand-fact-value" className="text-xs font-bold">
              Giá trị đang dùng
            </Label>
            <textarea
              id="brand-fact-value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              rows={5}
              data-drawer-initial-focus
              className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-card px-4 py-3 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-2 text-[11px] leading-4 text-foreground-muted">
              Thay đổi được lưu dưới dạng phiên bản mới. Giá trị cũ vẫn còn trong nhật ký.
            </p>
          </div>

          <section className="mt-6" aria-labelledby="fact-sources-title">
            <div className="flex items-center justify-between gap-3">
              <h3 id="fact-sources-title" className="text-sm font-extrabold text-foreground">
                Nguồn và bằng chứng
              </h3>
              <span className="text-[11px] font-semibold text-foreground-muted">
                {fact.provenance.length} nguồn
              </span>
            </div>
            <div className="mt-3 space-y-2">
              {fact.provenance.map((source) => (
                <article key={source.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <FileText className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-foreground">{source.label}</p>
                      <p className="mt-1 text-[11px] leading-4 text-foreground-muted">
                        {source.note}
                      </p>
                      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Quan sát {DATE_FORMATTER.format(new Date(source.observedAt))}
                      </p>
                    </div>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-foreground-muted hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        aria-label={`Mở nguồn ${source.label}`}
                      >
                        <ExternalLink className="size-4" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-card px-4 py-4 sm:px-5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={saveValue} disabled={!hasChanged || !value.trim()}>
              Lưu bản chỉnh sửa
            </Button>
            <Button onClick={saveAndConfirm} disabled={!value.trim()}>
              <ShieldCheck className="size-4" aria-hidden />
              Lưu và xác nhận
            </Button>
          </div>
        </footer>
      </section>
    </div>
  );
}
