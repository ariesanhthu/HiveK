'use client';

import { Button } from '@/components/ui/button';
import { Copy, RefreshCcw } from 'lucide-react';

type InviteLinkBlockProps = {
  inviteLink: string;
  onCopy: () => void;
  onGenerateCode?: () => void;
};

export function InviteLinkBlock({
  inviteLink,
  onCopy,
  onGenerateCode,
}: InviteLinkBlockProps) {
  return (
    <div className='rounded-lg border border-primary-soft bg-background-light p-3'>
      <p className='text-xs font-bold text-foreground'>Link mời chiến dịch</p>
      <div className='mt-2 rounded-md border border-primary-soft bg-card px-3 py-2 text-xs font-medium text-foreground-muted'>
        {inviteLink}
      </div>
      <div className='mt-3 flex flex-wrap gap-2'>
        <Button size='sm' onClick={onCopy}>
          <Copy className='size-3.5' aria-hidden />
          Copy link
        </Button>
        {onGenerateCode
          ? (
            <Button size='sm' variant='outline' onClick={onGenerateCode}>
              <RefreshCcw className='size-3.5' aria-hidden />
              Tạo mã mới
            </Button>
          )
          : null}
      </div>
    </div>
  );
}
