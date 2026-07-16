import { AgentProgressCard } from 'client';

const steps: any[] = [
  { id: 's1', label: 'Đọc dữ liệu đầu vào chiến dịch', status: 'done' },
  { id: 's2', label: 'Hiểu mục tiêu và đối tượng mục tiêu', status: 'done' },
  { id: 's3', label: 'Phân tích tone thương hiệu', status: 'done' },
  { id: 's4', label: 'Gợi ý KOL/KOC phù hợp', status: 'active' },
  { id: 's5', label: 'Tạo kế hoạch nội dung', status: 'queued' },
  { id: 's6', label: 'Chuẩn bị lịch trình đăng tự động', status: 'queued' },
];

export function InProgress() {
  return (
    <div style={{ width: 360 }}>
      <AgentProgressCard progress={45} steps={steps} />
    </div>
  );
}
