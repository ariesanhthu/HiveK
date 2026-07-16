import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkspaceStudioConfig } from "@/features/ai-chat/types/workspace-types";
import { cn } from "@/lib/utils";

export type StudioConfigChangeHandler = <K extends keyof WorkspaceStudioConfig>(
  key: K,
  value: WorkspaceStudioConfig[K]
) => void;

const FIELD_CLASS_NAME =
  "mt-2 w-full rounded-xl border border-primary-soft bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

type StudioFieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
};

function StudioFieldShell({
  id,
  label,
  hint,
  children,
}: StudioFieldShellProps) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="text-xs font-bold text-foreground">
        {label}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[11px] leading-5 text-foreground-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type StudioTextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  type?: "text" | "email" | "url";
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
};

export function StudioTextField({
  id,
  label,
  value,
  onChange,
  hint,
  placeholder,
  type = "text",
  required,
  autoComplete,
  disabled,
}: StudioTextFieldProps) {
  return (
    <StudioFieldShell id={id} label={label} hint={hint}>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-2 bg-card"
      />
    </StudioFieldShell>
  );
}

type StudioNumberFieldProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
};

export function StudioNumberField({
  id,
  label,
  value,
  onChange,
  hint,
  min,
  max,
  step,
}: StudioNumberFieldProps) {
  return (
    <StudioFieldShell id={id} label={label} hint={hint}>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber;
          if (!Number.isNaN(nextValue)) onChange(nextValue);
        }}
        min={min}
        max={max}
        step={step}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="mt-2 bg-card"
      />
    </StudioFieldShell>
  );
}

type StudioTextAreaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
};

export function StudioTextAreaField({
  id,
  label,
  value,
  onChange,
  hint,
  placeholder,
  rows = 4,
  required,
  disabled,
}: StudioTextAreaFieldProps) {
  return (
    <StudioFieldShell id={id} label={label} hint={hint}>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={cn(FIELD_CLASS_NAME, "resize-y leading-6")}
      />
    </StudioFieldShell>
  );
}

function parseList(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

type StudioListFieldProps = {
  id: string;
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
};

export function StudioListField({
  id,
  label,
  values,
  onChange,
  hint = "Mỗi dòng là một mục.",
  placeholder,
  rows = 4,
  disabled,
}: StudioListFieldProps) {
  const serializedValues = values.join("\n");
  const [draftValue, setDraftValue] = useState(serializedValues);

  useEffect(() => {
    setDraftValue((currentValue) =>
      parseList(currentValue).join("\n") === serializedValues
        ? currentValue
        : serializedValues
    );
  }, [serializedValues]);

  return (
    <StudioTextAreaField
      id={id}
      label={label}
      value={draftValue}
      onChange={(value) => {
        setDraftValue(value);
        onChange(parseList(value));
      }}
      hint={hint}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
    />
  );
}

export type StudioSelectOption = {
  value: string;
  label: string;
};

type StudioSelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: StudioSelectOption[];
  hint?: string;
  disabled?: boolean;
};

export function StudioSelectField({
  id,
  label,
  value,
  onChange,
  options,
  hint,
  disabled,
}: StudioSelectFieldProps) {
  return (
    <StudioFieldShell id={id} label={label} hint={hint}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className={FIELD_CLASS_NAME}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </StudioFieldShell>
  );
}

type StudioToggleProps = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function StudioToggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: StudioToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-16 cursor-pointer items-center justify-between gap-4 rounded-xl border border-primary-soft bg-card px-3.5 py-3 transition-colors hover:bg-primary-soft",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs leading-5 text-foreground-muted">
          {description}
        </span>
      </span>
      <span className="relative block h-6 w-11 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-muted-foreground/50 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-1 top-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}

type StudioPanelCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function StudioPanelCard({
  title,
  description,
  icon,
  action,
  children,
  className,
}: StudioPanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-primary-soft bg-card shadow-[0_10px_35px_rgba(15,23,42,0.04)]",
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-primary-soft px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-amber-700">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-foreground">{title}</h3>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-foreground-muted">
              {description}
            </p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

type StudioDisclosureProps = {
  title: string;
  description?: string;
  meta?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function StudioDisclosure({
  title,
  description,
  meta,
  children,
  defaultOpen,
}: StudioDisclosureProps) {
  const [isOpen, setIsOpen] = useState(Boolean(defaultOpen));

  return (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="group rounded-xl border border-primary-soft bg-card"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3.5 py-3 outline-none transition-colors hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block text-sm font-bold text-foreground">{title}</span>
          {description ? (
            <span className="mt-0.5 block text-xs leading-5 text-foreground-muted">
              {description}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {meta}
          <ChevronDown
            className="size-4 text-foreground-muted transition-transform group-open:rotate-180"
            aria-hidden
          />
        </span>
      </summary>
      <div className="border-t border-primary-soft p-3.5 sm:p-4">{children}</div>
    </details>
  );
}

export function StudioEmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-primary-soft bg-muted/45 px-4 py-6 text-center text-sm leading-6 text-foreground-muted">
      {children}
    </p>
  );
}

type StudioStatusPillProps = {
  tone?: "success" | "warning" | "neutral";
  children: ReactNode;
};

export function StudioStatusPill({
  tone = "neutral",
  children,
}: StudioStatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold",
        tone === "success" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        tone === "warning" &&
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        tone === "neutral" &&
          "border-primary-soft bg-muted text-foreground-muted"
      )}
    >
      {children}
    </span>
  );
}
