export type BillingCycle = 'monthly' | 'yearly';

export type PricingPlan = {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  description: string;
  icon: string;
  color: string;
  /** VND per month; null = contact sales. Yearly price is per-month, billed annually. */
  priceMonthly: number | null;
  priceYearly: number | null;
  cta: string;
  highlighted: boolean;
  features: string[];
};

export const YEARLY_DISCOUNT_LABEL = 'Tiết kiệm 20%';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Cho thương hiệu mới bắt đầu khám phá KOL marketing',
    icon: 'rocket_launch',
    color: 'var(--color-tech-blue)',
    priceMonthly: 0,
    priceYearly: 0,
    cta: 'Dùng miễn phí',
    highlighted: false,
    features: [
      '3 lượt ghép đôi AI mỗi tháng',
      'Xem bảng xếp hạng KOL/KOC',
      '1 chiến dịch đang chạy',
      'Báo cáo hiệu suất cơ bản',
      'Hỗ trợ qua email',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Cho đội ngũ marketing tăng trưởng chiến dịch nghiêm túc',
    icon: 'trending_up',
    color: 'var(--color-primary)',
    priceMonthly: 1_490_000,
    priceYearly: 1_190_000,
    cta: 'Bắt đầu 14 ngày miễn phí',
    highlighted: true,
    features: [
      'Ghép đôi AI không giới hạn',
      'Phân tích KOL chuyên sâu (uy tín, follower ảo)',
      '10 chiến dịch chạy đồng thời',
      'Bảng điều khiển thời gian thực + xuất báo cáo',
      'Chi trả an toàn qua ký quỹ',
      'Duyệt nội dung & lịch đăng bài tập trung',
      'Hỗ trợ ưu tiên 24/7',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Cho doanh nghiệp lớn cần giải pháp và hạn mức riêng',
    icon: 'corporate_fare',
    color: 'var(--color-creator-purple)',
    priceMonthly: null,
    priceYearly: null,
    cta: 'Liên hệ tư vấn',
    highlighted: false,
    features: [
      'Mọi tính năng của Growth',
      'Chiến dịch & thành viên không giới hạn',
      'Quản lý đa thương hiệu (multi-brand)',
      'API tích hợp & xuất dữ liệu tùy chỉnh',
      'Ký hợp đồng, hoá đơn doanh nghiệp',
      'Chuyên viên chăm sóc riêng (CSM)',
    ],
  },
];

export type ComparisonRow = {
  label: string;
  starter: string | boolean;
  growth: string | boolean;
  enterprise: string | boolean;
};

export const COMPARISON_GROUPS: { title: string; icon: string; rows: ComparisonRow[]; }[] = [
  {
    title: 'Ghép đôi & khám phá',
    icon: 'auto_awesome',
    rows: [
      {
        label: 'Lượt ghép đôi AI / tháng',
        starter: '3',
        growth: 'Không giới hạn',
        enterprise: 'Không giới hạn',
      },
      { label: 'Bảng xếp hạng KOL/KOC', starter: true, growth: true, enterprise: true },
      { label: 'Phân tích uy tín & follower ảo', starter: false, growth: true, enterprise: true },
    ],
  },
  {
    title: 'Chiến dịch',
    icon: 'campaign',
    rows: [
      {
        label: 'Chiến dịch chạy đồng thời',
        starter: '1',
        growth: '10',
        enterprise: 'Không giới hạn',
      },
      { label: 'Duyệt nội dung & lịch đăng', starter: false, growth: true, enterprise: true },
      { label: 'Chi trả an toàn qua ký quỹ', starter: false, growth: true, enterprise: true },
    ],
  },
  {
    title: 'Báo cáo & hỗ trợ',
    icon: 'monitoring',
    rows: [
      {
        label: 'Bảng điều khiển thời gian thực',
        starter: 'Cơ bản',
        growth: true,
        enterprise: true,
      },
      { label: 'API & xuất dữ liệu tùy chỉnh', starter: false, growth: false, enterprise: true },
      { label: 'Hỗ trợ', starter: 'Email', growth: 'Ưu tiên 24/7', enterprise: 'CSM riêng' },
    ],
  },
];

export const PRICING_FAQS: { question: string; answer: string; }[] = [
  {
    question: 'Tôi có thể dùng thử gói Growth trước khi trả phí không?',
    answer:
      'Có. Gói Growth có 14 ngày dùng thử miễn phí đầy đủ tính năng, không cần thẻ tín dụng. Hết hạn dùng thử, bạn có thể chọn thanh toán hoặc tự động chuyển về gói Starter.',
  },
  {
    question: 'Tôi có thể nâng cấp hoặc hạ gói bất kỳ lúc nào?',
    answer:
      'Được. Nâng cấp có hiệu lực ngay lập tức và chỉ tính phí phần chênh lệch theo tỷ lệ thời gian còn lại. Hạ gói sẽ áp dụng từ chu kỳ thanh toán kế tiếp.',
  },
  {
    question: 'Cơ chế ký quỹ (escrow) hoạt động thế nào?',
    answer:
      'Ngân sách chiến dịch được giữ an toàn tại Hive-K. Creator chỉ nhận thanh toán khi nội dung được nghiệm thu đúng thoả thuận — bảo vệ cả thương hiệu lẫn creator.',
  },
  {
    question: 'KOL/KOC tham gia nền tảng có mất phí không?',
    answer:
      'Không. Creator tạo hồ sơ, xác thực kênh và nhận chiến dịch hoàn toàn miễn phí. Hive-K chỉ thu phí nền tảng nhỏ trên mỗi giao dịch thành công.',
  },
  {
    question: 'Thanh toán hỗ trợ những hình thức nào?',
    answer:
      'Chuyển khoản ngân hàng, thẻ quốc tế (Visa/Mastercard) và các ví điện tử phổ biến tại Việt Nam. Gói Enterprise hỗ trợ hợp đồng và hoá đơn VAT doanh nghiệp.',
  },
];
