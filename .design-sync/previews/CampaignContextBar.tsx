import { CampaignContextBar } from 'client';

const campaign: any = {
  id: 'ontop-fashion-windbreaker',
  name: 'ON TOP Jacket Drop',
  status: 'reviewing',
  objective: 'sales',
  platforms: ['facebook', 'threads', 'instagram'],
  tone: { preset: 'youthful', emojiLevel: 'low' },
  invite: { defaultCode: 'ONTOP10' },
};

export function Default() {
  return (
    <div style={{ width: 920 }}>
      <CampaignContextBar
        campaign={campaign}
        onCopyInviteLink={() => {}}
        onEditBrief={() => {}}
      />
    </div>
  );
}
