'use client';

const ROWS = [
  {
    rank: 1,
    delta: 'same',
    name: 'Khoai Lang Thang',
    handle: '@Khoailangthang',
    niche: 'Du lịch',
    followers: '2.7M',
    score: 98.4,
    badge: 'Top 1',
  },
  {
    rank: 2,
    delta: 'up',
    name: 'MixiGaming',
    handle: '@mixigaming3con',
    niche: 'Gaming',
    followers: '8.2M',
    score: 96.1,
    badge: 'Ưu tú',
  },
  {
    rank: 3,
    delta: 'up',
    name: 'Sun HT',
    handle: '@SunHT',
    niche: 'Fitness',
    followers: '1.2M',
    score: 94.7,
    badge: 'Top 10',
  },
  {
    rank: 4,
    delta: 'down',
    name: 'Giang Ơi',
    handle: '@GiangOi',
    niche: 'Đời sống',
    followers: '2.2M',
    score: 91.3,
    badge: null,
  },
];

const BADGE_CLASS: Record<string, string> = {
  'Top 1': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'Ưu tú': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'Top 10': 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

const DELTA_ICON: Record<string, { icon: string; className: string; }> = {
  up: { icon: 'arrow_upward', className: 'text-emerald-600 dark:text-emerald-400' },
  down: { icon: 'arrow_downward', className: 'text-red-500' },
  same: { icon: 'remove', className: 'text-foreground-muted' },
};

export function RankingReplica() {
  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <span className='relative flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-emerald-500' />
          </span>
          <span className='text-[11px] font-bold text-emerald-700 dark:text-emerald-300'>
            Trực tiếp
          </span>
          <span className='text-[10px] text-foreground-muted'>· cập nhật 4s trước</span>
        </div>
        <div className='flex gap-2'>
          {['Tất cả ngách', 'Tất cả nền tảng'].map((f) => (
            <span
              key={f}
              className='rounded-full border border-primary-soft bg-muted px-2.5 py-1 text-[10px] font-semibold text-foreground-muted'
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className='overflow-hidden rounded-2xl border border-primary-soft'>
        <table className='w-full text-left text-xs'>
          <thead className='bg-muted/50'>
            <tr className='text-[10px] uppercase tracking-wide text-foreground-muted'>
              <th className='px-3 py-2 font-bold'>Hạng</th>
              <th className='px-3 py-2 font-bold'>Creator</th>
              <th className='hidden px-3 py-2 font-bold sm:table-cell'>Ngách</th>
              <th className='hidden px-3 py-2 font-bold sm:table-cell'>Followers</th>
              <th className='px-3 py-2 text-right font-bold'>Điểm</th>
              <th className='px-3 py-2 text-right font-bold'>Huy hiệu</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-primary-soft bg-card'>
            {ROWS.map((r) => {
              const d = DELTA_ICON[r.delta];
              return (
                <tr key={r.handle}>
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-1'>
                      <span className='font-black text-foreground'>{r.rank}</span>
                      <span
                        className={`material-symbols-outlined text-[13px] ${d.className}`}
                        aria-hidden
                      >
                        {d.icon}
                      </span>
                    </div>
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      <span className='flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[9px] font-black text-primary'>
                        {r.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div className='min-w-0'>
                        <p className='truncate font-bold text-foreground'>{r.name}</p>
                        <p className='truncate text-[10px] text-foreground-muted'>{r.handle}</p>
                      </div>
                    </div>
                  </td>
                  <td className='hidden px-3 py-2 text-foreground-muted sm:table-cell'>
                    {r.niche}
                  </td>
                  <td className='hidden px-3 py-2 text-foreground-muted sm:table-cell'>
                    {r.followers}
                  </td>
                  <td className='px-3 py-2 text-right font-black text-primary'>{r.score}</td>
                  <td className='px-3 py-2 text-right'>
                    {r.badge && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                          BADGE_CLASS[r.badge]
                        }`}
                      >
                        {r.badge}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
