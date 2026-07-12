/** Official 4-color Google "G" mark. */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.71H.9v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.9a9 9 0 0 0 0 8.08l3.05-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.96l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

/** Monochrome Apple mark — follows text color. */
function AppleLogo() {
  return (
    <svg width="16" height="18" viewBox="0 0 14 17" fill="currentColor" aria-hidden focusable="false">
      <path d="M11.62 9.06c-.02-1.96 1.6-2.9 1.67-2.95-.91-1.33-2.33-1.52-2.84-1.54-1.21-.12-2.36.71-2.98.71-.61 0-1.55-.7-2.55-.68-1.31.02-2.52.76-3.19 1.93-1.36 2.36-.35 5.86.98 7.78.65.93 1.42 1.98 2.44 1.94.98-.04 1.35-.63 2.53-.63 1.18 0 1.51.63 2.55.61 1.05-.02 1.72-.95 2.36-1.89.74-1.08 1.05-2.13 1.07-2.18-.02-.01-2.05-.79-2.07-3.1Z" />
      <path d="M9.65 3.05c.53-.65.89-1.54.79-2.44-.77.03-1.7.51-2.25 1.16-.49.57-.92 1.49-.81 2.36.86.07 1.73-.44 2.27-1.08Z" />
    </svg>
  );
}

/**
 * Social sign-in row for the glass card. UI-only until OAuth providers are
 * configured on the backend — buttons are disabled but keep the full glass
 * styling so the card doesn't look broken.
 */
export function AuthOAuth() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-white/10" aria-hidden />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
          Hoặc tiếp tục với
        </span>
        <span className="h-px flex-1 bg-white/10" aria-hidden />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          title="Sắp ra mắt"
          className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/85 transition-colors enabled:hover:border-white/25 enabled:hover:bg-white/10 disabled:cursor-not-allowed"
        >
          <GoogleLogo />
          Google
        </button>
        <button
          type="button"
          disabled
          title="Sắp ra mắt"
          className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white/85 transition-colors enabled:hover:border-white/25 enabled:hover:bg-white/10 disabled:cursor-not-allowed"
        >
          <AppleLogo />
          Apple
        </button>
      </div>

      <p className="text-center text-[11px] text-white/30">
        Đăng nhập mạng xã hội sẽ mở khi hoàn tất cấu hình OAuth.
      </p>
    </div>
  );
}
