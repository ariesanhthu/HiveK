import { CampaignBriefCard } from 'client';

export function Beauty() {
  return (
    <div style={{ width: 380 }}>
      <CampaignBriefCard
        brief={{
          niches: ['Làm đẹp', 'Skincare', 'Review mỹ phẩm', 'Lifestyle'],
          platforms: ['instagram', 'tiktok', 'youtube'],
          audience:
            'Nữ giới 18–30 tuổi tại các thành phố lớn (Hà Nội, TP.HCM, Đà Nẵng), quan tâm chăm sóc da và mỹ phẩm thuần chay.',
          pdfBriefLabel: 'Xem brief đầy đủ (PDF)',
        }}
      />
    </div>
  );
}

export function Tech() {
  return (
    <div style={{ width: 380 }}>
      <CampaignBriefCard
        brief={{
          niches: ['Công nghệ', 'Đánh giá sản phẩm', 'Gaming'],
          platforms: ['youtube', 'tiktok'],
          audience:
            'Nam giới 20–35 tuổi yêu công nghệ, thường xuyên theo dõi các kênh review điện thoại và thiết bị thông minh.',
          pdfBriefLabel: 'Tải brief kỹ thuật',
        }}
      />
    </div>
  );
}
