import { PostContentPanel } from 'client';

const post: any = {
  id: 'p1',
  day: 1,
  dateLabel: 'Thứ 2 · 15/06',
  time: '20:00',
  title: 'Teaser áo khoác gió ON TOP',
  goal: 'Tạo nhận biết sản phẩm mới + kéo comment hỏi size',
  platform: 'facebook',
  accountId: 'fb-ontop',
  content:
    'Có những ngày chỉ cần một chiếc áo khoác gọn là outfit nhìn chỉn chu hơn hẳn. ON TOP Jacket nhẹ, dễ phối, hợp đi học, đi làm lẫn cafe cuối tuần. Comment chiều cao/cân nặng, tụi mình gợi ý size và cách phối phù hợp nha.',
  firstComment: 'Ai cần tư vấn size cứ comment chiều cao/cân nặng bên dưới nhé!',
  suggestedReplies: ['Bạn cao bao nhiêu để shop tư vấn size?', 'Inbox shop để nhận mã OTOP10 nha', 'Áo còn đủ màu bạn nhé'],
  mediaAsset: undefined,
  mediaPrompt: 'Ảnh hero outfit streetwear tối giản, nền phố sạch, màu áo nổi rõ.',
  status: 'needs-review',
  reviewer: 'Hoàng Nam',
  reviewNote: '',
  scheduledAt: '2026-06-15T20:00',
  hashtags: ['#ONTOP', '#Aokhoacgio'],
};

const accounts: any[] = [
  { id: 'fb-ontop', platform: 'facebook', name: 'ON TOP Official' },
  { id: 'fb-ontop-shop', platform: 'facebook', name: 'ON TOP Shop HCM' },
];

export function Default() {
  return (
    <div style={{ width: 820 }}>
      <PostContentPanel
        post={post}
        accounts={accounts}
        onPostChange={() => {}}
        onPlatformChange={() => {}}
        onOptimizeContent={() => {}}
        onGenerateMedia={() => {}}
        onAddSuggestedReply={() => {}}
      />
    </div>
  );
}
