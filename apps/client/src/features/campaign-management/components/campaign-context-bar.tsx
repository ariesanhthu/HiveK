'use client';

import { Button } from '@/components/ui/button';
import {
  OBJECTIVE_LABELS,
  TONE_LABELS,
} from '@/features/campaign-management/data/campaign-management-options';
import type { CampaignBrief } from '@/features/campaign-management/types';
import { Copy, Pencil } from 'lucide-react';

type CampaignContextBarProps = {
  campaign: CampaignBrief;
  onCopyInviteLink: () => void;
  onEditBrief: () => void;
};

export function CampaignContextBar({
  campaign,
  onCopyInviteLink,
  onEditBrief,
}: CampaignContextBarProps) {
  return (
    <div className='mb-4 flex flex-col gap-3 rounded-lg border border-primary-soft bg-background-light p-3 lg:flex-row lg:items-center lg:justify-between'>
      <div className='min-w-0 text-xs text-foreground-muted'>
        <p className='font-semibold text-foreground'>
          Đang tạo từ chiến dịch: <span className='text-primary'>{campaign.name}</span>
        </p>
        <p className='mt-1'>
          Mục tiêu: {OBJECTIVE_LABELS[campaign.objective]} · Tone:{' '}
          {TONE_LABELS[campaign.tone.preset]},{' '}
          {campaign.tone.emojiLevel === 'low' ? 'ít emoji' : 'tuỳ chỉnh'} · Mã mời:{' '}
          <span className='font-bold text-primary'>{campaign.invite.defaultCode}</span>
        </p>
      </div>
      <div className='flex shrink-0 gap-2'>
        <Button size='sm' variant='outline' onClick={onEditBrief}>
          <Pencil className='size-3.5' aria-hidden />
          Sửa brief
        </Button>
        <Button size='sm' onClick={onCopyInviteLink}>
          <Copy className='size-3.5' aria-hidden />
          Copy link mời
        </Button>
      </div>
    </div>
  );
}
