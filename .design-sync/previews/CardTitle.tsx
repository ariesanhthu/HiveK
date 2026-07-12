import { Card, CardHeader, CardTitle, CardContent } from 'client';

export function Default() {
  return (
    <div style={{ width: 360 }}>
      <Card>
        <CardHeader>
          <CardTitle>Chiến dịch Tết 2025 — Mỹ phẩm Cocoon</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Tổng ngân sách 850 triệu ₫ · 24 KOL tham gia · chạy từ 05/01 đến 10/02.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function WithinReport() {
  return (
    <div style={{ width: 360 }}>
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo hiệu suất KOL</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Trang Hí đạt 1,2 triệu lượt xem trên chiến dịch skincare.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
