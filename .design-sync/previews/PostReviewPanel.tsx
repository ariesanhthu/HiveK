import { PostReviewPanel } from 'client';

const post: any = {
  id: 'p1',
  day: 1,
  dateLabel: 'Thứ 2 · 15/06',
  time: '20:00',
  title: 'Teaser áo khoác gió ON TOP',
  goal: '',
  platform: 'facebook',
  accountId: 'fb-ontop',
  content: '',
  firstComment: '',
  suggestedReplies: [],
  mediaPrompt: '',
  status: 'needs-review',
  reviewer: 'Hoàng Nam',
  reviewNote: 'Nội dung ổn, chỉ cần đẩy CTA lên câu cuối cho dễ scan hơn.',
  scheduledAt: '2026-06-15T20:00',
  hashtags: [],
};

export function NeedsReview() {
  return (
    <div style={{ width: 860 }}>
      <PostReviewPanel
        post={post}
        onPostChange={() => {}}
        onApprovePost={() => {}}
      />
    </div>
  );
}
