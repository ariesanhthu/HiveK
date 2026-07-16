import { CampaignCreateDrawer } from 'client';

const defaultForm: any = {
  name: 'ON TOP Jacket Drop',
  objective: 'sales',
  platforms: ['facebook', 'threads', 'instagram'],
  productName: 'Áo khoác gió ON TOP',
  cta: 'Comment size để được tư vấn',
  landingUrl: 'https://ontop.brand',
  description:
    'Chiến dịch ra mắt áo khoác gió ON TOP cho người trẻ cần một item gọn, dễ phối.',
  keyMessage: 'Nhẹ nhưng chỉn chu: cản gió, chống thấm nhẹ, phối được nhiều outfit.',
  targetAudience: 'Nam nữ 18-28 tuổi thành phố, thích streetwear tối giản.',
  customerInsight: 'Khách muốn áo nhìn gọn, lên ảnh đẹp nhưng vẫn hữu dụng.',
  usp: 'Form unisex, chất liệu nhẹ, màu trung tính dễ phối.',
  offer: 'Freeship đơn đầu + voucher 10% với mã OTOP10.',
  tonePreset: 'youthful',
  formality: 2,
  emojiLevel: 'low',
  language: 'vi',
  perspective: 'brand',
  requiredKeywords: 'áo khoác gió, unisex',
  bannedKeywords: 'rẻ nhất, chống nước 100%',
  suggestedHashtags: '#ONTOP, #OOTD',
  numberOfPosts: 9,
  variantsPerPost: 3,
  creativity: 4,
  approvalMode: 'per_post',
  inviteEnabled: true,
  inviteCode: 'ONTOP10',
};

export function Open() {
  return (
    <div style={{ position: 'relative', width: 1000, height: 760, overflow: 'hidden' }}>
      <CampaignCreateDrawer
        isOpen
        mode="create"
        defaultForm={defaultForm}
        onClose={() => {}}
        onCreateCampaign={() => {}}
      />
    </div>
  );
}
