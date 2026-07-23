import { CampaignDetailHeader } from 'client';

export function Active() {
  return (
    <div style={{ width: 900 }}>
      <CampaignDetailHeader
        title='Sữa Rửa Mặt Cocoon x Beauty KOLs'
        status='active'
        externalIdLabel='Mã chiến dịch: CDN-2024-0187'
        createdByLabel='Tạo bởi Nguyễn Thu Trang'
      />
    </div>
  );
}

export function Draft() {
  return (
    <div style={{ width: 900 }}>
      <CampaignDetailHeader
        title='Ra Mắt Nước Hoa TheFaceHolic Mùa Hè'
        status='draft'
        externalIdLabel='Mã chiến dịch: CDN-2024-0205'
        createdByLabel='Tạo bởi Trần Minh Quân'
      />
    </div>
  );
}

export function Closed() {
  return (
    <div style={{ width: 900 }}>
      <CampaignDetailHeader
        title='Review Điện Thoại Xiaomi 14T cùng Tech Reviewer'
        status='closed'
        externalIdLabel='Mã chiến dịch: CDN-2023-0921'
        createdByLabel='Tạo bởi Lê Hoàng Anh'
      />
    </div>
  );
}
