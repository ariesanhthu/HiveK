import { CampaignTrackingDashboard } from 'client';

const posts = (statuses: string[]) =>
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

const campaign: any = {
  id: 'ontop-fashion-windbreaker',
  name: 'ON TOP Jacket Drop',
  status: 'reviewing',
  postingPlan: [
    { day: 1, dateLabel: 'Thứ 2', posts: posts(['approved', 'scheduled']) },
    { day: 2, dateLabel: 'Thứ 4', posts: posts(['needs-review', 'draft']) },
    { day: 3, dateLabel: 'Thứ 6', posts: posts(['scheduled', 'draft']) },
  ],
  tracking: {
    impressions: 128400,
    reach: 64200,
    engagementRate: 5.8,
    clicks: 3420,
    comments: 486,
    leads: 214,
    conversionRate: 3.4,
    spend: 18500000,
    revenue: 62400000,
  },
};

export function Default() {
  return (
    <div style={{ width: 880 }}>
      <CampaignTrackingDashboard campaign={campaign} participantCount={6} />
    </div>
  );
}
