import { type CampaignDetailTab } from '@/features/campaign-planning/types/campaign-planning';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

type PostDetailShellProps = {
  activeTab: CampaignDetailTab;
  onTabChange: (tab: CampaignDetailTab) => void;
  children: ReactNode;
};

const TABS: { id: CampaignDetailTab; label: string; }[] = [
  { id: 'content', label: 'Nội dung' },
  { id: 'review', label: 'Review' },
  { id: 'schedule', label: 'Lịch đăng' },
];

export function PostDetailShell({
  activeTab,
  onTabChange,
  children,
}: PostDetailShellProps) {
  return (
    <section className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-primary-soft bg-card shadow-sm'>
      <div className='flex h-12 shrink-0 items-center justify-between border-b border-primary-soft bg-background-light/70 px-4 md:px-5'>
        <div className='flex h-full items-center gap-5'>
          <h2 className='text-sm font-extrabold text-foreground'>Chi Tiết Bài Viết</h2>
          <nav className='flex h-full items-center gap-1'>
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;

              return (
                <button
                  key={tab.id}
                  type='button'
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    'h-full border-b-2 px-3 text-xs font-bold transition-colors',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-foreground-muted hover:text-foreground',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          type='button'
          className='rounded-md p-1 text-foreground-muted transition-colors hover:bg-muted hover:text-foreground'
          aria-label='Đóng chi tiết bài viết'
        >
          <X className='size-4' aria-hidden />
        </button>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto p-4 md:p-5'>{children}</div>
    </section>
  );
}
