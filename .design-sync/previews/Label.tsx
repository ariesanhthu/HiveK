import { Label, Input } from 'client';

export function Default() {
  return <Label>Tên chiến dịch</Label>;
}

export function WithInput() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 280 }}>
      <Label htmlFor="email">Email liên hệ</Label>
      <Input id="email" placeholder="ban@thuonghieu.vn" />
    </div>
  );
}

export function Required() {
  return (
    <Label>
      Ngân sách chiến dịch <span style={{ color: '#f59e0b' }}>*</span>
    </Label>
  );
}
