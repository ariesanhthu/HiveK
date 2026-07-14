"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";

type BaseFieldProps = {
  id: string;
  label: string;
  /** material-symbols icon shown inside the input, lights up on focus. */
  icon: string;
  error?: string;
  /** Small element under the field, right-aligned (e.g. "Quên mật khẩu?"). */
  underSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

const INPUT_CLASS =
  "peer h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-12 pr-4 text-sm font-medium text-white outline-none transition-[border-color,box-shadow,background-color] hover:border-white/20 focus:border-[var(--auth-accent)] focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_var(--auth-ring)]";

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p
      id={`${id}-error`}
      role="alert"
      className="flex items-center gap-1 text-xs font-medium text-red-400"
    >
      <span className="material-symbols-outlined text-sm" aria-hidden>
        error
      </span>
      {error}
    </p>
  );
}

/**
 * Glass input with a floating label: the label sits inside the field as the
 * placeholder while empty, and glides up onto the top border on focus or
 * when the field has a value (see .hk-float in globals.css — transform-only
 * animation, no jank). The real placeholder only fades in once the label
 * has floated up. Accent comes from `--auth-accent` set by AuthShell.
 */
export function AuthField({ id, label, icon, error, underSlot, ...input }: BaseFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="hk-float">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={INPUT_CLASS}
          {...input}
          placeholder={input.placeholder ?? " "}
        />
        <label htmlFor={id}>{label}</label>
        {/* Placed after the input so peer-focus can tint it. */}
        <span
          className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-lg text-white/30 transition-colors peer-focus:text-[var(--auth-accent)]"
          aria-hidden
        >
          {icon}
        </span>
      </div>

      {underSlot ? <div className="flex justify-end">{underSlot}</div> : null}
      <FieldError id={id} error={error} />
    </div>
  );
}

/** AuthField with a show/hide visibility toggle. */
export function AuthPasswordField({
  id,
  label,
  error,
  underSlot,
  ...input
}: Omit<BaseFieldProps, "icon" | "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="hk-float">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${INPUT_CLASS} pr-12`}
          {...input}
          placeholder={input.placeholder ?? " "}
        />
        <label htmlFor={id}>{label}</label>
        <span
          className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 z-[1] -translate-y-1/2 text-lg text-white/30 transition-colors peer-focus:text-[var(--auth-accent)]"
          aria-hidden
        >
          lock
        </span>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3 top-1/2 z-[1] flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-white/35 transition-colors hover:text-white/70"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden>
            {visible ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>

      {underSlot ? <div className="flex justify-end">{underSlot}</div> : null}
      <FieldError id={id} error={error} />
    </div>
  );
}
