import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'client';

export function Default() {
  return (
    <div style={{ width: 360 }}>
      <Card>
        <CardHeader>
          <CardTitle>Ra mắt sữa rửa mặt Simple</CardTitle>
          <CardDescription>
            Đề xuất 12 KOL beauty phù hợp tệp khách hàng Gen Z, ngân sách 320 triệu ₫.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
            Ưu tiên creator có tỷ lệ tương tác trên 6% và tệp nữ 18–24 tuổi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function StatCaption() {
  return (
    <div style={{ width: 360 }}>
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ chuyển đổi</CardTitle>
          <CardDescription>Tính trên tổng lượt click affiliate trong 30 ngày</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#0f172a' }}>4,8%</div>
        </CardContent>
      </Card>
    </div>
  );
}
