import { CreatorSuggestionsTab } from 'client';

const campaign: any = {
  id: 'ontop-fashion-windbreaker',
  name: 'ON TOP Jacket Drop',
  invite: { inviteLink: '/campaigns/ontop-fashion-windbreaker/invite?code=ONTOP10' },
};

const suggestions: any[] = [
  {
    id: 'creator-1',
    name: 'Mina Outfit',
    type: 'koc',
    platforms: ['instagram', 'threads'],
    niche: ['fashion', 'ootd', 'minimal style'],
    followerRange: '30K - 50K',
    engagementRate: 4.8,
    audienceMatchScore: 89,
    estimatedCost: '1.500.000đ - 2.500.000đ',
    reason: [
      'Tệp người xem quan tâm outfit hằng ngày và streetwear tối giản.',
      'Nội dung thường có carousel phối đồ, dễ gắn sản phẩm.',
    ],
    contactStatus: 'not_contacted',
  },
  {
    id: 'creator-2',
    name: 'Tú Mix Đồ',
    type: 'creator',
    platforms: ['instagram', 'facebook'],
    niche: ['men fashion', 'streetwear review'],
    followerRange: '80K - 120K',
    engagementRate: 5.2,
    audienceMatchScore: 84,
    estimatedCost: '3.000.000đ - 5.000.000đ',
    reason: [
      'Thế mạnh video ngắn dạng phối 3 outfit.',
      'Review chất liệu thực tế, dễ nói rõ ưu điểm cản gió.',
    ],
    contactStatus: 'invited',
  },
];

export function Default() {
  return (
    <div style={{ width: 860 }}>
      <CreatorSuggestionsTab
        campaign={campaign}
        suggestions={suggestions}
        onGenerateSuggestions={() => {}}
        onCopyMessage={() => {}}
        onMarkContacted={() => {}}
      />
    </div>
  );
}
