import type { KolAnalysisProfile } from '@/features/kol-analysis/types';

type SelectedProfileCardProps = {
  profile: KolAnalysisProfile;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en').format(value);
}

export function SelectedProfileCard({ profile }: SelectedProfileCardProps) {
  return (
    <div className='rounded-2xl border border-primary-soft bg-card p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <img
          src={profile.avatarUrl}
          alt=''
          className='h-12 w-12 rounded-full border border-primary-soft'
        />
        <div className='min-w-0'>
          <h3 className='truncate text-lg font-bold text-foreground'>{profile.name}</h3>
          <p className='text-sm text-foreground-muted'>
            {profile.platform} / {profile.niche}
          </p>
        </div>
      </div>

      <dl className='mt-4 grid grid-cols-2 gap-3 text-sm'>
        <div className='rounded-xl bg-muted p-3'>
          <dt className='text-xs text-foreground-muted'>Followers</dt>
          <dd className='mt-1 font-bold text-foreground'>{formatNumber(profile.followers)}</dd>
        </div>
        <div className='rounded-xl bg-muted p-3'>
          <dt className='text-xs text-foreground-muted'>Engagement</dt>
          <dd className='mt-1 font-bold text-foreground'>{profile.engagementRate.toFixed(2)}%</dd>
        </div>
        <div className='rounded-xl bg-primary-soft p-3'>
          <dt className='text-xs text-foreground-muted'>KOL Score</dt>
          <dd className='mt-1 font-bold text-foreground'>{profile.kolScore.toFixed(2)}</dd>
        </div>
        <div className='rounded-xl bg-muted p-3'>
          <dt className='text-xs text-foreground-muted'>Risk</dt>
          <dd className='mt-1 font-bold text-foreground'>{profile.controversyRisk.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
