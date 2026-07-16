import { DashboardRecentActivities } from 'client';

const activities = [
  {
    id: 'a1',
    title: 'Chiến dịch "Ra mắt Mùa hè 2024" cần duyệt',
    description: 'KOL Mai Anh Beauty đã gửi nội dung để phê duyệt.',
    timeLabel: '5 phút trước',
    status: 'review' as const,
    icon: 'rate_review',
  },
  {
    id: 'a2',
    title: 'Video review của Trần Quốc Huy đã lên sóng',
    description: 'Đạt 128K lượt xem trong 2 giờ đầu tiên.',
    timeLabel: '1 giờ trước',
    status: 'active' as const,
    icon: 'play_circle',
  },
  {
    id: 'a3',
    title: 'Thanh toán hoa hồng đã hoàn tất',
    description: 'Đã chuyển 15.000.000 ₫ cho 3 nhà sáng tạo.',
    timeLabel: 'Hôm qua',
    status: 'paid' as const,
    icon: 'payments',
  },
  {
    id: 'a4',
    title: 'Ngân sách chiến dịch sắp cạn',
    description: 'Chiến dịch "Khuyến mãi Đồ công nghệ" còn 8% ngân sách.',
    timeLabel: '2 ngày trước',
    status: 'alert' as const,
    icon: 'warning',
  },
];

export function Default() {
  return (
    <div style={{ width: 640 }}>
      <DashboardRecentActivities activities={activities} />
    </div>
  );
}
