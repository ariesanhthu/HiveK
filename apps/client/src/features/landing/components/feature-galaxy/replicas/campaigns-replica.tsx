'use client';

import { useState } from 'react';

const TABS = ['Cấu hình', 'Content', 'Tracking', 'Người tham gia'];

const CAMPAIGNS = [
  {
    name: 'Glow Summer Skincare',
    status: 'Đã lên lịch',
    tone: 'success' as const,
    objective: 'Ra mắt sản phẩm · Chăm sóc da',
    platforms: ['TikTok', 'Instagram'],
    posts: 12,
    scheduled: 8,
    people: 5,
  },
  {
    name: 'Nike: Tốc độ Tương lai',
    status: 'Đang duyệt',
    tone: 'warning' as const,
    objective: 'Nhận diện thương hiệu · Giày dép',
    platforms: ['YouTube', 'TikTok'],
    posts: 6,
    scheduled: 2,
    people: 3,
  },
];

const TONE_CLASS: Record<string, string> = {
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

export function CampaignsReplica() {
  const [tab, setTab] = useState(0);

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <p className='text-xs font-bold text-foreground'>Chiến dịch của bạn</p>
        <span className='inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-background-dark'>
          <span className='material-symbols-outlined text-xs' aria-hidden>add</span>
          Thêm chiến dịch
        </span>
      </div>

      <div className='space-y-3'>
        {CAMPAIGNS.map((c) => (
          <div key={c.name} className='rounded-2xl border border-primary-soft bg-card p-3.5'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-3'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-black text-primary'>
                  {c.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <p className='text-sm font-bold text-foreground'>{c.name}</p>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                        TONE_CLASS[c.tone]
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className='text-[10px] text-foreground-muted'>{c.objective}</p>
                  <div className='mt-1.5 flex gap-1.5'>
                    {c.platforms.map((p) => (
                      <span
                        key={p}
                        className='rounded-full border border-primary-soft bg-muted px-2 py-0.5 text-[9px] font-semibold text-foreground-muted'
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className='grid shrink-0 grid-cols-3 gap-2 text-center'>
                <div>
                  <p className='text-sm font-black text-foreground'>{c.posts}</p>
                  <p className='text-[9px] text-foreground-muted'>Bài</p>
                </div>
                <div>
                  <p
                    className='text-sm font-black text-tech-blue'
                    style={{ color: 'var(--color-tech-blue)' }}
                  >
                    {c.scheduled}
                  </p>
                  <p className='text-[9px] text-foreground-muted'>Đã lên lịch</p>
                </div>
                <div>
                  <p className='text-sm font-black text-primary'>{c.people}</p>
                  <p className='text-[9px] text-foreground-muted'>Người</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-primary-soft bg-card p-3.5'>
        <div className='flex gap-4 border-b border-primary-soft pb-2'>
          {TABS.map((t, i) => (
            <button
              key={t}
              type='button'
              onClick={() => setTab(i)}
              className={`text-[11px] font-bold transition-colors ${
                i === tab
                  ? 'border-b-2 border-primary pb-2 text-primary'
                  : 'pb-2 text-foreground-muted hover:text-foreground'
              }`}
              style={i === tab ? { marginBottom: -9 } : undefined}
            >
              {t}
            </button>
          ))}
        </div>
        <div className='pt-3'>
          {tab === 0 && (
            <div className='grid grid-cols-3 gap-2 text-center'>
              {['Sản phẩm', 'Thông điệp', 'CTA'].map((k) => (
                <div key={k} className='rounded-xl border border-primary-soft bg-muted/40 p-2'>
                  <p className='text-[9px] text-foreground-muted'>{k}</p>
                  <p className='text-[11px] font-bold text-foreground'>—</p>
                </div>
              ))}
            </div>
          )}
          {tab === 1 && (
            <div className='rounded-xl border border-dashed border-primary-soft p-4 text-center text-[11px] text-foreground-muted'>
              Caption &amp; hình ảnh theo từng nền tảng
            </div>
          )}
          {tab === 2 && (
            <div className='flex items-center justify-between rounded-xl border border-primary-soft bg-muted/40 p-3 text-[11px]'>
              <span className='text-foreground-muted'>Tiến độ đăng bài</span>
              <span className='font-black text-primary'>8/12 hoàn thành</span>
            </div>
          )}
          {tab === 3 && (
            <div className='flex -space-x-2'>
              {[1, 2, 3, 4].map((n) => (
                <span
                  key={n}
                  className='flex size-7 items-center justify-center rounded-full border-2 border-card bg-primary-soft text-[9px] font-bold text-primary'
                >
                  KOL
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
