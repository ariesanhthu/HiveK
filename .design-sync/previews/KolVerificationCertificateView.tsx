import { KolVerificationCertificateView } from 'client';

const avatarUrl = 'data:image/svg+xml;utf8,'
  + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="112" height="112"><rect width="112" height="112" fill="#fbcfe8"/><circle cx="56" cy="44" r="24" fill="#db2777"/><rect x="24" y="72" width="64" height="40" rx="18" fill="#db2777"/></svg>',
  );

const data = {
  slug: 'nguyen-linh-chi',
  displayName: 'Nguyễn Linh Chi',
  roleLabel: 'Beauty Creator · TikTok & Instagram',
  verificationId: 'HK-2026-0417-LC',
  issueDateLabel: '08 tháng 7, 2026',
  aggregateRating: 4.7,
  avatarUrl,
  competencies: [
    { key: 'authentic' as const, title: 'Xác thực', subtext: 'Audience thật > 94%, không bot' },
    { key: 'impact' as const, title: 'Hiệu quả', subtext: 'CVR chiến dịch trung bình 3.8%' },
    { key: 'history' as const, title: 'Lịch sử', subtext: '32 chiến dịch hoàn thành' },
  ],
  checks: [
    { id: 'c1', label: 'Đã xác minh danh tính qua CCCD và số điện thoại', passed: true },
    { id: 'c2', label: 'Chỉ số tương tác được kiểm chứng độc lập', passed: true },
    { id: 'c3', label: 'Không có vi phạm brand-safety trong 12 tháng', passed: true },
    { id: 'c4', label: 'Sở hữu kênh được xác nhận qua OAuth nền tảng', passed: true },
  ],
  partnerFeedback: [
    {
      id: 'f1',
      quote:
        'Linh Chi giao nội dung đúng hạn, chất lượng cao và tỷ lệ chuyển đổi vượt kỳ vọng cho dòng serum mới của chúng tôi.',
      partnerName: 'La Roche-Posay VN',
      rating: '5.0 / 5',
    },
    {
      id: 'f2',
      quote:
        'Tương tác chân thực, cộng đồng phản hồi tích cực. Sẽ tiếp tục hợp tác trong các đợt ra mắt tới.',
      partnerName: 'Hasaki Beauty',
      rating: '4.6 / 5',
    },
  ],
  issuingAuthority: 'HiveK Creator Trust Authority',
  digitalSignatureLabel: 'Chữ ký số bởi HiveK Verification Engine',
  signatureHash: 'sha256:9f3c8a1e7b204d6f8e2a5c9d1b0f4e7a6c3d8b2f1a5e9c0d7b4f2a8e1c6d3b9f',
};

export function Default() {
  return (
    <KolVerificationCertificateView
      data={data}
      verifyUrl='https://hivek.vn/verify/HK-2026-0417-LC'
    />
  );
}
