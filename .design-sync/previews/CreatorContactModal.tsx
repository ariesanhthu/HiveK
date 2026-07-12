import { CreatorContactModal } from 'client';

const campaign: any = {
  id: 'ontop-fashion-windbreaker',
  name: 'ON TOP Jacket Drop',
  invite: { inviteLink: '/campaigns/ontop-fashion-windbreaker/invite?code=ONTOP10' },
};

const creator: any = {
  id: 'creator-1',
  name: 'Mina Outfit',
  type: 'koc',
  platforms: ['instagram', 'threads'],
  niche: ['fashion', 'ootd'],
  followerRange: '30K - 50K',
  engagementRate: 4.8,
  audienceMatchScore: 89,
  estimatedCost: '1.500.000đ - 2.500.000đ',
  reason: [],
  contactStatus: 'not_contacted',
  contactInfo: { instagram: '@mina.outfit' },
};

export function Default() {
  return (
    <div style={{ position: 'relative', width: 900, height: 720, overflow: 'hidden' }}>
      <CreatorContactModal
        campaign={campaign}
        creator={creator}
        onClose={() => {}}
        onCopyMessage={() => {}}
        onMarkContacted={() => {}}
      />
    </div>
  );
}
