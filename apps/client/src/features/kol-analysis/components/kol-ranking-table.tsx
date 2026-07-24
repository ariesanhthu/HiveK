import type { KolAnalysisProfile } from '@/features/kol-analysis/types';

type KolRankingTableProps = {
  profiles: KolAnalysisProfile[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

function getScoreWidth(score: number) {
  return `${Math.max(8, Math.min(100, score))}%`;
}

function getRiskTone(risk: number) {
  if (risk < 3) return 'bg-green-50 text-green-700';
  if (risk < 6) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

export function KolRankingTable({ profiles }: KolRankingTableProps) {
  return (
    <section className='space-y-3'>
      <div>
        <h2 className='text-xl font-bold text-foreground'>KOL Ranking Table</h2>
        <p className='text-sm text-foreground-muted'>
          Sorted by weighted KOL Score. Lower controversy risk is better.
        </p>
      </div>

      <div className='overflow-hidden rounded-2xl border border-primary-soft bg-card shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-[920px] w-full text-left text-sm'>
            <thead className='bg-muted text-xs uppercase tracking-wide text-foreground-muted'>
              <tr>
                <th className='px-4 py-3 font-semibold'>Creator</th>
                <th className='px-4 py-3 font-semibold'>Platform</th>
                <th className='px-4 py-3 font-semibold'>Niche</th>
                <th className='px-4 py-3 font-semibold'>Followers</th>
                <th className='px-4 py-3 font-semibold'>Engagement</th>
                <th className='px-4 py-3 font-semibold'>Sentiment</th>
                <th className='px-4 py-3 font-semibold'>Risk</th>
                <th className='px-4 py-3 font-semibold'>KOL Score</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-primary-soft'>
              {profiles.map((profile) => (
                <tr key={profile.id} className='transition-colors hover:bg-primary-soft'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={profile.avatarUrl}
                        alt=''
                        className='h-9 w-9 rounded-full border border-primary-soft'
                      />
                      <div>
                        <p className='font-semibold text-foreground'>{profile.name}</p>
                        <p className='text-xs text-foreground-muted'>@{profile.youtubeHandle}</p>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-foreground-muted'>{profile.platform}</td>
                  <td className='px-4 py-3'>
                    <span className='rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground'>
                      {profile.niche}
                    </span>
                  </td>
                  <td className='px-4 py-3 font-medium text-foreground'>
                    {formatNumber(profile.followers)}
                  </td>
                  <td className='px-4 py-3 text-foreground-muted'>
                    {profile.engagementRate.toFixed(2)}%
                  </td>
                  <td className='px-4 py-3 text-foreground-muted'>
                    {profile.sentimentScoreComponent.toFixed(2)}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        getRiskTone(profile.controversyRisk)
                      }`}
                    >
                      {profile.controversyRisk.toFixed(2)}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex min-w-36 items-center gap-2'>
                      <div className='h-2 flex-1 rounded-full bg-muted'>
                        <div
                          className='h-2 rounded-full bg-primary'
                          style={{ width: getScoreWidth(profile.kolScore) }}
                        />
                      </div>
                      <span className='w-11 text-right font-bold text-foreground'>
                        {profile.kolScore.toFixed(2)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
