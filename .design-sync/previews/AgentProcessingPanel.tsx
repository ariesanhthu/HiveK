import { AgentProcessingPanel } from 'client';

const stages = [
  { id: 's1', label: 'Phân tích yêu cầu chiến dịch', detail: 'Đọc tóm tắt sản phẩm và mục tiêu.' },
  { id: 's2', label: 'Quét cơ sở dữ liệu nhà sáng tạo', detail: 'Lọc 12.400 hồ sơ theo lĩnh vực.' },
  { id: 's3', label: 'Chấm điểm độ phù hợp', detail: 'Đối chiếu tệp khán giả và hiệu suất.' },
  { id: 's4', label: 'Ước tính ngân sách & ROI', detail: 'Dự báo CPA và tỷ suất hoàn vốn.' },
  { id: 's5', label: 'Tạo danh sách rút gọn', detail: 'Xếp hạng ứng viên đề xuất.' },
];

export function Default() {
  return (
    <div style={{ width: 960 }}>
      <AgentProcessingPanel stages={stages} activeStageIndex={2} />
    </div>
  );
}
