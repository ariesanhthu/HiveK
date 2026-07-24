'use client';

import { Button } from '@/components/ui/button';
import { DashboardSidebar } from '@/features/business-dashboard/components/dashboard-sidebar';
import { useBusinessNavItems } from '@/features/business-dashboard/hooks/use-business-nav-items';
import { CampaignConfigPanel } from '@/features/campaign-management/components/campaign-config-panel';
import { CampaignContextBar } from '@/features/campaign-management/components/campaign-context-bar';
import { CampaignCreateDrawer } from '@/features/campaign-management/components/campaign-create-drawer';
import { CampaignListPanel } from '@/features/campaign-management/components/campaign-list-panel';
import { CampaignTrackingDashboard } from '@/features/campaign-management/components/campaign-tracking-dashboard';
import { CreatorSuggestionsTab } from '@/features/campaign-management/components/creator-suggestions-tab';
import { ParticipantsTab } from '@/features/campaign-management/components/participants-tab';
import { PostingRoadmap } from '@/features/campaign-management/components/posting-roadmap';
import { useCampaignManagement } from '@/features/campaign-management/hooks/use-campaign-management';
import type { CampaignDetailTab, CampaignPostingDay } from '@/features/campaign-management/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, X } from 'lucide-react';
import { useMemo, useState } from 'react';

const TABS: { id: CampaignDetailTab; label: string; }[] = [
  { id: 'config', label: 'Cấu hình' },
  { id: 'content', label: 'Content' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'roadmap', label: 'Lộ trình' },
  { id: 'review', label: 'Review' },
  { id: 'creators', label: 'KOL/KOC' },
  { id: 'participants', label: 'Người tham gia' },
];

function EmptyCampaignState({ onCreate }: { onCreate: () => void; }) {
  return (
    <div className='flex h-full items-center justify-center rounded-lg border border-dashed border-primary-soft bg-card p-8 text-center'>
      <div>
        <p className='text-base font-extrabold text-foreground'>
          Chưa có chiến dịch nào.
        </p>
        <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-foreground-muted'>
          Hãy tạo chiến dịch đầu tiên để quản lý brief, content, lộ trình đăng bài và người tham
          gia.
        </p>
        <Button className='mt-5' onClick={onCreate}>
          + Thêm chiến dịch mới
        </Button>
      </div>
    </div>
  );
}

function ReviewTab() {
  return (
    <div className='mx-auto max-w-3xl rounded-lg border border-primary-soft bg-background-light p-4'>
      <p className='text-sm font-extrabold text-foreground'>Review readiness</p>
      <p className='mt-2 text-sm leading-6 text-foreground-muted'>
        Kiểm tra trạng thái brief, content, lịch đăng và rủi ro trước khi chuyển sang bước lên bài
        tự động.
      </p>
      <div className='mt-4 grid gap-3 md:grid-cols-3'>
        {['Brief đã đủ dữ liệu', 'Content theo nền tảng', 'Q&A agent sẵn sàng'].map(
          (item) => (
            <div key={item} className='rounded-lg border border-primary-soft bg-card p-3'>
              <p className='text-xs font-bold text-emerald-600'>{item}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function RoadmapTab({ postingPlan }: { postingPlan: CampaignPostingDay[]; }) {
  return (
    <div className='mx-auto max-w-4xl rounded-lg border border-primary-soft bg-card p-4'>
      <div className='mb-4'>
        <p className='text-sm font-extrabold text-foreground'>Lộ trình đăng bài</p>
        <p className='mt-1 text-xs text-foreground-muted'>
          Mỗi ngày gồm nhiều node nhỏ, mỗi node là một bài đăng để dễ quản lý.
        </p>
      </div>
      <PostingRoadmap postingPlan={postingPlan} />
    </div>
  );
}

export function CampaignManagementPage() {
  const navItems = useBusinessNavItems();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CampaignDetailTab>('config');
  const [pageNotice, setPageNotice] = useState('');
  const {
    defaultForm,
    getCampaignForm,
    campaigns,
    selectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    participantCounts,
    creatorSuggestions,
    participants,
    notice,
    clearNotice,
    createCampaign,
    updateCampaign,
    generateCreatorSuggestions,
    addCreatorAsParticipant,
    addParticipant,
    removeParticipant,
  } = useCampaignManagement();

  const copyText = async (text: string, message: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
    setPageNotice(message);
  };

  const currentNotice = pageNotice || notice;
  const drawerForm = useMemo(
    () =>
      editingCampaignId && selectedCampaign
        ? getCampaignForm(selectedCampaign)
        : defaultForm,
    [defaultForm, editingCampaignId, getCampaignForm, selectedCampaign],
  );

  return (
    <main className='flex min-h-screen w-full bg-background-light'>
      <DashboardSidebar items={navItems} />

      <div className='flex h-screen min-w-0 flex-1 flex-col overflow-hidden'>
        <header className='shrink-0 border-b border-primary-soft bg-card px-4 py-4 md:px-6'>
          <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
            <div className='min-w-0'>
              <h1 className='text-2xl font-extrabold tracking-tight text-foreground'>
                Quản lý Chiến dịch
              </h1>
              <p className='mt-1 text-xs leading-5 text-foreground-muted'>
                Quản lý list chiến dịch, tracking tổng quan, content, ảnh, Q&A và người tham gia
                trước khi lên bài tự động.
              </p>
            </div>

            <div className='flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center'>
              <Button
                variant='outline'
                onClick={() => {
                  setEditingCampaignId(null);
                  setIsCreateOpen(true);
                }}
              >
                + Thêm chiến dịch mới
              </Button>
            </div>
          </div>
        </header>

        {currentNotice
          ? (
            <div className='mx-4 mt-3 flex items-center justify-between rounded-lg border border-primary-soft bg-primary-soft px-4 py-2 text-sm font-semibold text-foreground md:mx-6'>
              <span>{currentNotice}</span>
              <button
                type='button'
                onClick={() => {
                  setPageNotice('');
                  clearNotice();
                }}
                className='rounded-md p-1 text-foreground-muted hover:text-foreground'
                aria-label='Đóng thông báo'
              >
                <X className='size-4' aria-hidden />
              </button>
            </div>
          )
          : null}

        <div className='min-h-0 flex-1 overflow-hidden p-4'>
          {!isDetailOpen
            ? (
              <CampaignListPanel
                campaigns={campaigns}
                selectedCampaignId={selectedCampaignId}
                participantCounts={participantCounts}
                className='h-full'
                onSelectCampaign={(campaignId) => {
                  setSelectedCampaignId(campaignId);
                  setActiveTab('config');
                  setIsDetailOpen(true);
                }}
                onCreateCampaign={() => {
                  setEditingCampaignId(null);
                  setIsCreateOpen(true);
                }}
                onOpenTab={(tab) => {
                  setActiveTab(tab);
                  setIsDetailOpen(true);
                }}
              />
            )
            : (
              <section className='flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-primary-soft bg-card shadow-sm'>
                <div className='flex h-12 shrink-0 items-center justify-between border-b border-primary-soft bg-background-light/70 px-4 md:px-5'>
                  <div className='flex h-full min-w-0 items-center gap-5'>
                    <button
                      type='button'
                      onClick={() => setIsDetailOpen(false)}
                      className='inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-foreground-muted hover:bg-muted hover:text-foreground'
                    >
                      <ArrowLeft className='size-4' aria-hidden />
                      Danh sách
                    </button>
                    <h2 className='shrink-0 text-sm font-extrabold text-foreground'>
                      Chi tiết chiến dịch
                    </h2>
                    <nav className='flex h-full min-w-0 items-center gap-1 overflow-x-auto'>
                      {TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type='button'
                          onClick={() => setActiveTab(tab.id)}
                          className={cn(
                            'h-full shrink-0 border-b-2 px-3 text-xs font-bold transition-colors',
                            activeTab === tab.id
                              ? 'border-primary text-primary'
                              : 'border-transparent text-foreground-muted hover:text-foreground',
                          )}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className='min-h-0 flex-1 overflow-y-auto p-4 md:p-5'>
                  {selectedCampaign
                    ? (
                      <>
                        <CampaignContextBar
                          campaign={selectedCampaign}
                          onEditBrief={() => {
                            setEditingCampaignId(selectedCampaign.id);
                            setIsCreateOpen(true);
                          }}
                          onCopyInviteLink={() =>
                            void copyText(selectedCampaign.invite.inviteLink, 'Đã copy link mời.')}
                        />

                        {activeTab === 'config' || activeTab === 'content'
                          ? <CampaignConfigPanel campaign={selectedCampaign} />
                          : null}
                        {activeTab === 'roadmap'
                          ? <RoadmapTab postingPlan={selectedCampaign.postingPlan} />
                          : null}
                        {activeTab === 'tracking'
                          ? (
                            <CampaignTrackingDashboard
                              campaign={selectedCampaign}
                              participantCount={participants.length}
                            />
                          )
                          : null}
                        {activeTab === 'review' ? <ReviewTab /> : null}
                        {activeTab === 'creators'
                          ? (
                            <CreatorSuggestionsTab
                              campaign={selectedCampaign}
                              suggestions={creatorSuggestions}
                              onGenerateSuggestions={generateCreatorSuggestions}
                              onCopyMessage={(message) =>
                                void copyText(message, 'Đã copy nội dung.')}
                              onMarkContacted={(creator) =>
                                addCreatorAsParticipant(selectedCampaign.id, creator)}
                            />
                          )
                          : null}
                        {activeTab === 'participants'
                          ? (
                            <ParticipantsTab
                              campaign={selectedCampaign}
                              participants={participants}
                              onAddParticipant={(input) =>
                                addParticipant(selectedCampaign.id, input)}
                              onCopyInviteLink={(link) => void copyText(link, 'Đã copy link mời.')}
                              onRemoveParticipant={(participantId) =>
                                removeParticipant(selectedCampaign.id, participantId)}
                            />
                          )
                          : null}
                      </>
                    )
                    : <EmptyCampaignState onCreate={() => setIsCreateOpen(true)} />}
                </div>
              </section>
            )}
        </div>
      </div>

      <CampaignCreateDrawer
        isOpen={isCreateOpen}
        defaultForm={drawerForm}
        mode={editingCampaignId ? 'edit' : 'create'}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingCampaignId(null);
        }}
        onCreateCampaign={(input) => {
          if (editingCampaignId) {
            updateCampaign(editingCampaignId, input);
          } else {
            createCampaign(input);
            setIsDetailOpen(true);
          }
        }}
      />
    </main>
  );
}
