import { CampaignListPanel } from 'client';

const mkPosts = (statuses: string[]) =>
  statuses.map((status, i) => ({
    id: `p${i}`,
    title: `Bài ${i + 1}`,
    platform: 'facebook',
    contentType: 'caption',
    status,
    time: '20:00',
    owner: 'Content team',
    angle: '',
  }));

const campaigns: any[] = [
  {
    id: 'ontop-fashion-windbreaker',
    name: 'ON TOP Jacket Drop',
    status: 'scheduled',
    objective: 'sales',
    platforms: ['facebook', 'threads', 'instagram'],
    productName: 'Áo khoác gió ON TOP',
    description:
      'Chiến dịch ra mắt áo khoác gió ON TOP cho người trẻ cần một item gọn, dễ phối, đi học đi làm đi chơi đều dùng được.',
    postingPlan: [
      { day: 1, dateLabel: 'Thứ 2', posts: mkPosts(['approved', 'scheduled']) },
      { day: 2, dateLabel: 'Thứ 4', posts: mkPosts(['scheduled', 'draft']) },
    ],
  },
  {
    id: 'lala-skincare-serum',
    name: 'LALA Serum B5',
    status: 'reviewing',
    objective: 'awareness',
    platforms: ['instagram', 'threads'],
    productName: 'Serum phục hồi B5',
    description:
      'Ra mắt serum B5 phục hồi da cho nhóm da nhạy cảm, đẩy nội dung review chân thực từ KOC beauty.',
    postingPlan: [
      { day: 1, dateLabel: 'Thứ 3', posts: mkPosts(['needs-review', 'draft', 'draft']) },
    ],
  },
];

export function TwoCampaigns() {
  return (
    <div style={{ width: 880, height: 620 }}>
      <CampaignListPanel
        campaigns={campaigns}
        selectedCampaignId="ontop-fashion-windbreaker"
        participantCounts={{ 'ontop-fashion-windbreaker': 6, 'lala-skincare-serum': 3 }}
        onSelectCampaign={() => {}}
        onCreateCampaign={() => {}}
        onOpenTab={() => {}}
        className="h-full"
      />
    </div>
  );
}
