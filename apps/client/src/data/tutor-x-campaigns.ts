import type { CampaignListItem } from "@/features/campaigns/types";

/**
 * Tutor X ICP — chiến dịch gia sư & homestay thay thế các chiến dịch
 * thương hiệu cũ (skincare, Nike, …). Dữ liệu minh hoạ.
 */
export const TUTOR_X_CAMPAIGNS: CampaignListItem[] = [
  {
    id: "tutor-math-q1",
    image: "/images/campaigns/tutor-math.png",
    category: "Giáo dục",
    title: "Tuyển gia sư Toán lớp 10-12 khu vực Quận 1",
    priceRange: "200K - 400K/buổi",
    status: "active",
  },
  {
    id: "homestay-dalat-promo",
    image: "/images/campaigns/homestay-dalat.png",
    category: "Du lịch",
    title: "Homestay Đà Lạt — Tìm cộng tác viên quảng bá",
    priceRange: "2.000.000đ - 5.000.000đ",
    status: "active",
  },
  {
    id: "tutor-english-online",
    image: "/images/campaigns/tutor-english.png",
    category: "Giáo dục",
    title: "Chương trình gia sư Tiếng Anh online",
    priceRange: "250K - 500K/buổi",
    status: "active",
  },
  {
    id: "homestay-hoian-culture",
    image: "/images/campaigns/homestay-hoian.png",
    category: "Du lịch",
    title: "Homestay Hội An — Trải nghiệm văn hóa",
    priceRange: "3.000.000đ - 8.000.000đ",
    status: "active",
  },
  {
    id: "tutor-programming",
    image: "/images/campaigns/tutor-programming.png",
    category: "Giáo dục",
    title: "Tuyển gia sư Tin học & Lập trình",
    priceRange: "300K - 600K/buổi",
    status: "active",
  },
];
