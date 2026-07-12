import { PostSchedulePanel } from 'client';

const post: any = {
  id: 'p1',
  day: 1,
  dateLabel: 'Thứ 2 · 15/06',
  time: '20:00',
  title: 'Teaser áo khoác gió ON TOP',
  goal: '',
  platform: 'facebook',
  accountId: 'fb-ontop',
  content:
    'Có những ngày chỉ cần một chiếc áo khoác gọn là outfit nhìn chỉn chu hơn hẳn. ON TOP Jacket nhẹ, dễ phối, hợp đi học, đi làm lẫn cafe cuối tuần.',
  firstComment: '',
  suggestedReplies: [],
  mediaPrompt: '',
  status: 'approved',
  reviewer: 'Hoàng Nam',
  reviewNote: '',
  scheduledAt: '2026-06-15T20:00',
  hashtags: ['#ONTOP', '#Aokhoacgio', '#StreetwearVietnam'],
};

export function Approved() {
  return (
    <div style={{ width: 860 }}>
      <PostSchedulePanel post={post} onPostChange={() => {}} />
    </div>
  );
}
