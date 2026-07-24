import { PostingRoadmap } from 'client';

const postingPlan: any[] = [
  {
    day: 1,
    dateLabel: 'Thứ 2 · Tuần ra mắt',
    posts: [
      {
        id: 'post-fb-teaser',
        title: 'Teaser jacket mới',
        platform: 'facebook',
        contentType: 'album',
        status: 'approved',
        time: '09:00',
        owner: 'Content team',
        angle: 'Một item gọn cho ngày không biết mặc gì.',
      },
      {
        id: 'post-threads-q',
        title: 'Gợi chuyện chọn màu',
        platform: 'threads',
        contentType: 'thread',
        status: 'scheduled',
        time: '12:30',
        owner: 'Agent AI',
        angle: 'Team basic hay màu nổi?',
      },
    ],
  },
  {
    day: 2,
    dateLabel: 'Thứ 4 · Đẩy cân nhắc',
    posts: [
      {
        id: 'post-ig-carousel',
        title: '3 cách phối jacket',
        platform: 'instagram',
        contentType: 'carousel',
        status: 'needs-review',
        time: '19:30',
        owner: 'Designer',
        angle: 'Carousel phối đồ đi học, đi làm, cafe.',
      },
      {
        id: 'post-fb-material',
        title: 'Detail chất liệu',
        platform: 'facebook',
        contentType: 'caption',
        status: 'draft',
        time: '20:15',
        owner: 'Agent AI',
        angle: 'Cản gió, chống thấm nhẹ, form unisex.',
      },
    ],
  },
  {
    day: 3,
    dateLabel: 'Thứ 6 · Chốt chuyển đổi',
    posts: [
      {
        id: 'post-fb-offer',
        title: 'Mã OTOP10',
        platform: 'facebook',
        contentType: 'caption',
        status: 'draft',
        time: '20:00',
        owner: 'Sales team',
        angle: 'Comment mã nhận voucher đơn đầu tiên.',
      },
    ],
  },
];

export function Full() {
  return (
    <div style={{ width: 420 }}>
      <PostingRoadmap postingPlan={postingPlan} />
    </div>
  );
}

export function Compact() {
  return (
    <div style={{ width: 420 }}>
      <PostingRoadmap postingPlan={postingPlan} compact />
    </div>
  );
}
