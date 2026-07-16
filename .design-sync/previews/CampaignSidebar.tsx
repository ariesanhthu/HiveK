import { CampaignSidebar } from 'client';

const campaign: any = {
  id: 'ontop-fashion-windbreaker',
  name: 'ON TOP Jacket Drop',
  status: 'reviewing',
  objective: 'sales',
  platforms: ['facebook', 'threads', 'instagram'],
  tone: { preset: 'youthful' },
  aiConfig: { numberOfPosts: 9 },
  invite: {
    enabled: true,
    defaultCode: 'ONTOP10',
    inviteLink: '/campaigns/ontop-fashion-windbreaker/invite?code=ONTOP10',
    permissions: ['view_brief'],
  },
};

export function ReadyToPlan() {
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CampaignSidebar
        campaign={campaign}
        validationMessages={[]}
        participantCount={6}
        onCopyInviteLink={() => {}}
      />
    </div>
  );
}

export function NeedsInput() {
  return (
    <div style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <CampaignSidebar
        campaign={campaign}
        validationMessages={[
          'Chưa nhập thông điệp chính (key message)',
          'Chưa mô tả đối tượng mục tiêu',
        ]}
        participantCount={2}
        onCopyInviteLink={() => {}}
      />
    </div>
  );
}
