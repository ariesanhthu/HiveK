import { AUTH_ROUTES } from '@/features/auth/constants';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Quên mật khẩu | Hive-K',
  robots: { index: false, follow: false },
};

const ACCENT = 'var(--color-primary)';

export default function ForgotPasswordPage() {
  return (
    <div className='w-full max-w-md' style={{ '--auth-accent': ACCENT } as React.CSSProperties}>
      <div className='mb-8 flex flex-col items-center gap-4 text-center'>
        <span
          className='inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold'
          style={{
            color: ACCENT,
            borderColor: `color-mix(in srgb, ${ACCENT} 35%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${ACCENT} 10%, transparent)`,
          }}
        >
          <span className='material-symbols-outlined text-sm' aria-hidden>
            lock_reset
          </span>
          Khôi phục truy cập
        </span>
        <h1 className='text-3xl font-black leading-tight tracking-tight text-white md:text-4xl'>
          Quên <span style={{ color: ACCENT }}>mật khẩu</span>?
        </h1>
        <p className='max-w-md text-sm leading-relaxed text-white/55'>
          Tính năng gửi email đặt lại mật khẩu đang được kết nối với backend.
        </p>
      </div>

      <div
        className='relative rounded-[1.75rem] p-px'
        style={{
          background:
            `linear-gradient(165deg, color-mix(in srgb, ${ACCENT} 50%, transparent) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.06) 62%, color-mix(in srgb, ${ACCENT} 28%, transparent) 100%)`,
        }}
      >
        <div
          className='relative flex flex-col items-center gap-5 overflow-hidden rounded-[calc(1.75rem-1px)] px-6 py-9 text-center sm:px-9'
          style={{ backgroundColor: 'rgba(10, 14, 28, 0.86)', backdropFilter: 'blur(16px)' }}
        >
          <span
            className='pointer-events-none absolute inset-x-10 top-0 h-px'
            style={{
              background:
                `linear-gradient(90deg, transparent, color-mix(in srgb, ${ACCENT} 75%, white), transparent)`,
            }}
            aria-hidden
          />

          <span
            className='flex h-14 w-14 items-center justify-center rounded-2xl'
            style={{
              backgroundColor: `color-mix(in srgb, ${ACCENT} 14%, transparent)`,
              border: `1px solid color-mix(in srgb, ${ACCENT} 40%, transparent)`,
            }}
          >
            <span
              className='material-symbols-outlined text-2xl'
              style={{ color: ACCENT }}
              aria-hidden
            >
              mark_email_unread
            </span>
          </span>

          <p className='text-sm leading-relaxed text-white/55'>
            Liên kết đặt lại mật khẩu chỉ dùng được một lần và có thời hạn sử dụng. Trong lúc chờ
            tính năng mở, hãy liên hệ đội ngũ Hive-K nếu bạn mất quyền truy cập.
          </p>

          <Link
            href={AUTH_ROUTES.SIGN_IN}
            className='flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-background-dark shadow-primary transition-colors hover:bg-primary/90'
          >
            <span className='material-symbols-outlined text-lg' aria-hidden>
              arrow_back
            </span>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
