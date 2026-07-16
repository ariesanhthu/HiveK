import { DashboardSidebar } from 'client';

const items = [
  { id: 'n1', label: 'Tổng quan', icon: 'dashboard', href: '#', isActive: true },
  { id: 'n2', label: 'Chiến dịch', icon: 'campaign', href: '#', isActive: false },
  { id: 'n3', label: 'Nhà sáng tạo', icon: 'diversity_3', href: '#', isActive: false },
  { id: 'n4', label: 'Phân tích', icon: 'analytics', href: '#', isActive: false },
  { id: 'n5', label: 'Thanh toán', icon: 'payments', href: '#', isActive: false },
  { id: 'n6', label: 'Cài đặt', icon: 'settings', href: '#', isActive: false },
];

export function Default() {
  return (
    <div style={{ height: 720, display: 'flex' }}>
      <DashboardSidebar items={items} />
    </div>
  );
}
