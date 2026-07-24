import { PublishingTimeline } from 'client';

const mk = (id: string, time: string, title: string, status: string) => ({
  id,
  day: 1,
  dateLabel: '',
  time,
  title,
  goal: '',
  platform: 'facebook',
  accountId: 'a1',
  content: '',
  firstComment: '',
  suggestedReplies: [],
  mediaPrompt: '',
  status,
  reviewer: '',
  reviewNote: '',
  scheduledAt: '',
  hashtags: [],
});

const days: any[] = [
  {
    day: 1,
    dateLabel: 'Thứ 2 · 15/06',
    posts: [
      mk('p1', '09:00', 'Teaser áo khoác mới', 'approved'),
      mk('p2', '12:30', 'Gợi chuyện chọn màu', 'scheduled'),
    ],
  },
  {
    day: 2,
    dateLabel: 'Thứ 4 · 17/06',
    posts: [
      mk('p3', '19:30', '3 cách phối jacket', 'needs-review'),
      mk('p4', '20:15', 'Detail chất liệu cản gió', 'draft'),
    ],
  },
  {
    day: 3,
    dateLabel: 'Thứ 6 · 19/06',
    posts: [mk('p5', '20:00', 'Chốt ưu đãi mã OTOP10', 'draft')],
  },
];

export function Expanded() {
  return (
    <div style={{ width: 340, height: 560 }}>
      <PublishingTimeline
        days={days}
        selectedPostId='p3'
        isCompact={false}
        onCompactChange={() => {}}
        onPostSelect={() => {}}
      />
    </div>
  );
}

export function Compact() {
  return (
    <div style={{ width: 340, height: 400 }}>
      <PublishingTimeline
        days={days}
        selectedPostId='p3'
        isCompact
        onCompactChange={() => {}}
        onPostSelect={() => {}}
      />
    </div>
  );
}
