export type AmbassadorCampaignStatus = "ĐANG ĐĂNG BÀI" | "CHỜ DUYỆT" | "ĐANG LÊN KẾ HOẠCH" | "ĐÃ HOÀN THÀNH";

export interface AmbassadorCampaign {
  id: string;
  title: string;
  brand: string;
  category: string;
  dateRange: string;
  shortStatus: AmbassadorCampaignStatus;
  statusDetail: string;
  progressPercent: number;
  progressLabel: string;
  imageUrl: string;
  /** Slug sản phẩm dùng để tạo link certificate-product. */
  productSlug: string;
}

export const AMBASSADOR_CAMPAIGNS: AmbassadorCampaign[] = [
  {
    id: "1",
    title: "Bộ sưu tập Mùa Hè Năng Động",
    brand: "NIKE GLOBAL",
    category: "Thể hình & Đời sống",
    dateRange: "15 Thg 6 - 30 Thg 7, 2024",
    shortStatus: "ĐANG ĐĂNG BÀI",
    statusDetail: "! Hạn chót trong 2 ngày", // We will render the icon dynamically in the component
    progressPercent: 75,
    progressLabel: "KPI HIỆU SUẤT",
    imageUrl: "/placeholder.png", // Will use colored initial boxes in UI if no image
    productSlug: "nike-future-speed-run",
  },
  {
    id: "2",
    title: "Series Công nghệ Tối giản",
    brand: "LUMIX TECH",
    category: "Công nghệ",
    dateRange: "01 Thg 5 - 10 Thg 6, 2024",
    shortStatus: "CHỜ DUYỆT",
    statusDetail: "Đã nộp ngày 24 Thg 5",
    progressPercent: 100,
    progressLabel: "KPI HIỆU SUẤT",
    imageUrl: "/placeholder.png",
    productSlug: "soundmaster-pro-review",
  },
  {
    id: "3",
    title: "Thử thách Chăm sóc Da",
    brand: "PURE SKIN",
    category: "Làm đẹp",
    dateRange: "01 Thg 7 - 15 Thg 8, 2024",
    shortStatus: "ĐANG LÊN KẾ HOẠCH",
    statusDetail: "Đã phê duyệt",
    progressPercent: 0,
    progressLabel: "KPI HIỆU SUẤT",
    imageUrl: "/placeholder.png",
    productSlug: "summer-glow-skincare",
  },
  {
    id: "4",
    title: "Thói quen Buổi sáng",
    brand: "BEAN & CO",
    category: "Ẩm thực",
    dateRange: "Hoàn thành ngày 12 Thg 5, 2024",
    shortStatus: "ĐÃ HOÀN THÀNH",
    statusDetail: "ĐÃ THANH TOÁN",
    progressPercent: 112,
    progressLabel: "KPI HIỆU SUẤT",
    imageUrl: "/placeholder.png",
    productSlug: "barista-series-home-hub",
  }
];

export const AMBASSADOR_METRICS = [
  {
    id: "active",
    title: "Chiến dịch Hoạt động",
    value: "12",
    badgeLabel: "+2 tuần này",
    badgeType: "success",
    iconKey: "rocket"
  },
  {
    id: "pending",
    title: "Công việc Chờ xử lý",
    value: "05",
    badgeLabel: "Khẩn cấp",
    badgeType: "warning",
    iconKey: "clipboard"
  },
  {
    id: "completed",
    title: "Chiến dịch Hoàn thành",
    value: "32",
    badgeLabel: "Tổng số 48",
    badgeType: "neutral",
    iconKey: "checkcircle"
  },
  {
    id: "success",
    title: "Tỷ lệ Thành công",
    value: "98.4%",
    badgeLabel: "Top 5%",
    badgeType: "success",
    iconKey: "trendingup"
  }
];
