/* ------------------------------------------------------------------ */
/*  Certificate Product – Mock Data                                    */
/*  Builds on real seeds: KOL_SEEDS, ACTIVE_CAMPAIGNS, .kol-cache      */
/* ------------------------------------------------------------------ */

import type {
  CertificateProduct,
  CertificateKol,
  CertificateComment,
  CertificatePerk,
} from "@/features/certificate-product/types";

/* ───────── Products (derived from ACTIVE_CAMPAIGNS) ───────── */

export const CERTIFICATE_PRODUCTS: Record<string, CertificateProduct> = {
  "summer-glow-skincare": {
    id: "summer-glow-skincare",
    name: "Summer Glow Serum",
    description:
      "Tinh chất dưỡng da chuyên sâu với Vitamin C và Hyaluronic Acid, giúp da sáng mịn suốt mùa hè.",
    price: 890_000,
    currency: "₫",
    imageUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
    category: "Chăm sóc da",
    productPageUrl: "https://www.laneige.com/vn/vi/skincare/cream-skin-toner-and-moisturizer.html",
  },
  "nike-future-speed-run": {
    id: "nike-future-speed-run",
    name: "Nike AeroSwift Ultra Runners",
    description:
      "Giày chạy bộ siêu nhẹ với công nghệ đệm phản hồi năng lượng, tối ưu cho hiệu suất thi đấu.",
    price: 3_490_000,
    currency: "₫",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwjmWA007lPftgh2qO-ZPcC_mzJl1FpPS4C6ghQVU3NWtROXP4gAThNxOPWgYvSvIVJ52l6ruIQQHFsElIw8I9FdR-cgHNep_pOgHEbRIbCs4Ll40cVAy9WfuHLSLoDD0h97-NIlh2oxBEcUY8-BvOUQEGxK26Zg8EN88JuI6t_QfTIpo4o8SEvozI2aArxijJ1jpmjMSaLe1YTLlULjTO29kH_NNRj5TCel7L6jonJSKxAd4lT_LS-XUaDX_rUuP7SmV1OismRo",
    category: "Giày dép",
    productPageUrl: "https://www.nike.com/vn/t/star-runner-5-younger-running-shoes-7vHlQm23/HF7005-010",
  },
  "soundmaster-pro-review": {
    id: "soundmaster-pro-review",
    name: "SoundMaster Pro X1",
    description:
      "Hệ thống âm thanh cao cấp với công nghệ Dolby Atmos, mang đến trải nghiệm rạp chiếu tại gia.",
    price: 12_990_000,
    currency: "₫",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4gDyTExo7JHPJhFGLA1XGBMAAGr1hVcrRQY8l5v2tQEIE9C6dyQOKIzF47f-yi5tukgIiPoOv0PL9eV2HfNri99JLKbncAHxXUl8GceBmeg6SSapfuATebfqUUZC9yKbcIltw-hm1j3UfWdQ4uTrIJsJ7lI_P_-FXsgTYqtqtHb8Ih5l3pK41FsHdjkX1Zi1sapXdJAC933HGqEF5YenG-i8TyQ_F3eXjz0WHGPHNeusvCfGKvEot-URRCeIEeM80s97Q-zb0bcg",
    category: "Điện tử",
    productPageUrl: "https://www.sony.com.vn/electronics/loa-soundbar/ht-a9000",
  },
  "elite-chrono-collection": {
    id: "elite-chrono-collection",
    name: "Elite Chrono Heritage",
    description:
      "Đồng hồ cao cấp phiên bản giới hạn, mặt kính sapphire, bộ máy Swiss Made chính hãng.",
    price: 28_900_000,
    currency: "₫",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCx6Vdn_4jBlqNYfFDAPiJdPNNYoCabdh19H7HPUNtiHdn2cDQX24gVnCj-9JWLgyE0ouBjGdKwcaPFKDOfzz2Yc6qaRMLspmCAzUxIb23g69wGCi6gLzf3A0oSb01YKsNrx3ALruHI98sC9bpxh9CWcuvNRC-lQMnX70J3IDq14cyG9EsdcLcpIGyd9K6JIEKHSSyGWYKJPpttPbLuBYcj5jbaY7ula4JFzrqtS1h7UVdsd4OSuGWkAwphMjVU_Q_0DDUYMEtltsQ",
    category: "Thời trang cao cấp",
    productPageUrl: "https://www.danielwellington.com/vn/iconic-chronograph-42-rose-gold/",
  },
  "barista-series-home-hub": {
    id: "barista-series-home-hub",
    name: "Barista Home Hub Pro",
    description:
      "Máy pha cà phê chuyên nghiệp tại nhà với 15 bar áp suất và hệ thống tạo bọt sữa tự động.",
    price: 8_490_000,
    currency: "₫",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGNFx3ga3X-8637lzaPRAq_1ZHlA7hi7p5b7GWKOJQoVbyqT0sAppFzUJhqr9PSwqXA2PxZC0g6x4N6uKb3jQ5AbrcUMBDMDXbwRaKJA6MbHhenSmsm5zG_HfPH8OaZnSWjx5o8zhVefYq0Z3z6fdQdsclsyjMb8RazsTvcHhXc7UbIt09Yw5kjrhyuZegRVS-pcj0PGtxtiHggrAekejcpTL9UgATYK1vByWBYMP1_rN8d0NmLwNUxn2CDP1OyYNjJmtLsVhzD24",
    category: "Đồ gia dụng",
    productPageUrl: "https://www.delonghi.com/vi-vn/magnifica-evo-ecam290-61-sb/p/ECAM290.61.SB",
  },
};

/* ───────── KOLs (derived from KOL_SEEDS + .kol-cache) ───────── */

function formatReach(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export const CERTIFICATE_KOLS: Record<string, CertificateKol> = {
  "kol-001": {
    id: "kol-001",
    name: "MixiGaming",
    avatarUrl:
      "https://yt3.googleusercontent.com/YaAFWY03ER0DfF77HAyMqNlRxmJiSEDq_I7ZF0MlcgRcVzOhIhZfB8QlwNhAuVXZesi2I2zy=s900-c-k-c0x00ffffff-no-rj",
    niche: "Gaming & Giải trí",
    rating: 4.93,
    ratingCount: 2400,
    reach: formatReach(8_220_000),
    isVerified: true,
    reviewQuote:
      "Mình đã dùng sản phẩm này suốt 3 tháng qua và thực sự ấn tượng. Chất lượng vượt xa mong đợi, mình hoàn toàn tin tưởng giới thiệu đến cộng đồng.",
    videoThumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwjmWA007lPftgh2qO-ZPcC_mzJl1FpPS4C6ghQVU3NWtROXP4gAThNxOPWgYvSvIVJ52l6ruIQQHFsElIw8I9FdR-cgHNep_pOgHEbRIbCs4Ll40cVAy9WfuHLSLoDD0h97-NIlh2oxBEcUY8-BvOUQEGxK26Zg8EN88JuI6t_QfTIpo4o8SEvozI2aArxijJ1jpmjMSaLe1YTLlULjTO29kH_NNRj5TCel7L6jonJSKxAd4lT_LS-XUaDX_rUuP7SmV1OismRo",
    videoEmbedUrl: "/khoai-video.mp4",
  },
  "kol-002": {
    id: "kol-002",
    name: "Tinh Tế",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_kB_3u5h7RnUlKTlUte52ePdyUkiAFxK0dBoh8X2Owq4w=s900-c-k-c0x00ffffff-no-rj",
    niche: "Công nghệ",
    rating: 4.89,
    ratingCount: 1800,
    reach: formatReach(3_200_000),
    isVerified: true,
    reviewQuote:
      "Sau khi trải nghiệm thực tế, mình đánh giá sản phẩm này rất đáng đồng tiền. Build quality tốt, tính năng đầy đủ cho nhu cầu hàng ngày.",
    videoThumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4gDyTExo7JHPJhFGLA1XGBMAAGr1hVcrRQY8l5v2tQEIE9C6dyQOKIzF47f-yi5tukgIiPoOv0PL9eV2HfNri99JLKbncAHxXUl8GceBmeg6SSapfuATebfqUUZC9yKbcIltw-hm1j3UfWdQ4uTrIJsJ7lI_P_-FXsgTYqtqtHb8Ih5l3pK41FsHdjkX1Zi1sapXdJAC933HGqEF5YenG-i8TyQ_F3eXjz0WHGPHNeusvCfGKvEot-URRCeIEeM80s97Q-zb0bcg",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "kol-003": {
    id: "kol-003",
    name: "Giang Ơi",
    avatarUrl:
      "https://yt3.googleusercontent.com/3OEPSJcC1pjZpre5w2kXpwL8sX-jUGsvpC5CukZUc324yE-dqpMi8LUrNJbv9dua3eTy7Vuf=s900-c-k-c0x00ffffff-no-rj",
    niche: "Đời sống",
    rating: 4.91,
    ratingCount: 1500,
    reach: formatReach(2_180_000),
    isVerified: true,
    reviewQuote:
      "Sản phẩm này thực sự thay đổi routine hàng ngày của mình. Chất lượng tuyệt vời và rất phù hợp với lifestyle hiện đại.",
    videoThumbnailUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "kol-004": {
    id: "kol-004",
    name: "Khoai Lang Thang",
    avatarUrl:
      "https://yt3.googleusercontent.com/EFB13mILKGh6KbJnTUayPFRw11s4iKhz6GtpbfTl2AAwmUo0FFB2jbxpOup4j5w0gAhYKyqudR4=s900-c-k-c0x00ffffff-no-rj",
    niche: "Du lịch & Ẩm thực",
    rating: 4.86,
    ratingCount: 1200,
    reach: formatReach(2_650_000),
    isVerified: true,
    reviewQuote:
      "Mình đã mang theo sản phẩm này trong nhiều chuyến đi và nó luôn hoạt động hoàn hảo. Chất lượng bền bỉ, thiết kế tinh tế — đúng chuẩn cho người yêu trải nghiệm.",
    videoThumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCx6Vdn_4jBlqNYfFDAPiJdPNNYoCabdh19H7HPUNtiHdn2cDQX24gVnCj-9JWLgyE0ouBjGdKwcaPFKDOfzz2Yc6qaRMLspmCAzUxIb23g69wGCi6gLzf3A0oSb01YKsNrx3ALruHI98sC9bpxh9CWcuvNRC-lQMnX70J3IDq14cyG9EsdcLcpIGyd9K6JIEKHSSyGWYKJPpttPbLuBYcj5jbaY7ula4JFzrqtS1h7UVdsd4OSuGWkAwphMjVU_Q_0DDUYMEtltsQ",
    videoEmbedUrl: "/khoai-video.mp4",
  },
  "kol-005": {
    id: "kol-005",
    name: "Chi Pu",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_nJMB_RTSkLUoHs6qCcbM7EjaZ7UR0eqsHraJVS-mB2Jg=s900-c-k-c0x00ffffff-no-rj",
    niche: "Làm đẹp",
    rating: 4.88,
    ratingCount: 3200,
    reach: formatReach(3_800_000),
    isVerified: true,
    reviewQuote:
      "Đây là sản phẩm mình tin dùng hàng ngày. Hiệu quả thấy rõ sau 2 tuần sử dụng, chắc chắn sẽ tiếp tục ủng hộ!",
    videoThumbnailUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "kol-006": {
    id: "kol-006",
    name: "Chloe Nguyễn",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_k1rGK0MkQwNSIequknZ7b8WabTnjqvEfN1Stb7yGHmQlA=s900-c-k-c0x00ffffff-no-rj",
    niche: "Làm đẹp",
    rating: 4.82,
    ratingCount: 980,
    reach: formatReach(1_300_000),
    isVerified: true,
    reviewQuote:
      "Sản phẩm này hoàn toàn xứng đáng với giá tiền. Texture mịn, thẩm thấu nhanh và không gây kích ứng da nhạy cảm.",
    videoThumbnailUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "kol-007": {
    id: "kol-007",
    name: "Vật Vờ Studio",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_kkJYJKaAPW9fpqrxzPu1KaFTGKUJ8oOJQ0IjodE3FeFw=s900-c-k-c0x00ffffff-no-rj",
    niche: "Công nghệ",
    rating: 4.79,
    ratingCount: 1600,
    reach: formatReach(2_050_000),
    isVerified: true,
    reviewQuote:
      "Review chi tiết: sản phẩm đạt 9/10 điểm từ mình. Thiết kế đẹp, hiệu năng ổn định và quan trọng nhất là giá hợp lý cho phân khúc này.",
    videoThumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4gDyTExo7JHPJhFGLA1XGBMAAGr1hVcrRQY8l5v2tQEIE9C6dyQOKIzF47f-yi5tukgIiPoOv0PL9eV2HfNri99JLKbncAHxXUl8GceBmeg6SSapfuATebfqUUZC9yKbcIltw-hm1j3UfWdQ4uTrIJsJ7lI_P_-FXsgTYqtqtHb8Ih5l3pK41FsHdjkX1Zi1sapXdJAC933HGqEF5YenG-i8TyQ_F3eXjz0WHGPHNeusvCfGKvEot-URRCeIEeM80s97Q-zb0bcg",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "kol-008": {
    id: "kol-008",
    name: "Sun HT",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_nwiNWEuXX3dEwPZFkJgPN1-kxEIhQs5dbSUv0WaSWuxA=s900-c-k-c0x00ffffff-no-rj",
    niche: "Fitness & Lifestyle",
    rating: 4.84,
    ratingCount: 1100,
    reach: formatReach(1_200_000),
    isVerified: true,
    reviewQuote:
      "Sản phẩm được thiết kế rất phù hợp cho lifestyle năng động. Mình đã test qua nhiều buổi tập và rất hài lòng với độ bền cũng như cảm giác sử dụng.",
    videoThumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwjmWA007lPftgh2qO-ZPcC_mzJl1FpPS4C6ghQVU3NWtROXP4gAThNxOPWgYvSvIVJ52l6ruIQQHFsElIw8I9FdR-cgHNep_pOgHEbRIbCs4Ll40cVAy9WfuHLSLoDD0h97-NIlh2oxBEcUY8-BvOUQEGxK26Zg8EN88JuI6t_QfTIpo4o8SEvozI2aArxijJ1jpmjMSaLe1YTLlULjTO29kH_NNRj5TCel7L6jonJSKxAd4lT_LS-XUaDX_rUuP7SmV1OismRo",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "kol-009": {
    id: "kol-009",
    name: "Ninh Tito",
    avatarUrl:
      "https://yt3.googleusercontent.com/WEHCMR1Ri0GwRRsUJjvkNL65xbMmP9E82StTxx81p07hAIafEtYYFtEHjyenUEW3iK1BcF6X=s900-c-k-c0x00ffffff-no-rj",
    niche: "Thể hình",
    rating: 4.9,
    ratingCount: 900,
    reach: formatReach(1_580_000),
    isVerified: true,
    reviewQuote:
      "Anh em nào đang tìm sản phẩm chất lượng thì thử cái này đi. Mình dùng thấy khác biệt rõ rệt so với các sản phẩm cùng phân khúc.",
    videoThumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwjmWA007lPftgh2qO-ZPcC_mzJl1FpPS4C6ghQVU3NWtROXP4gAThNxOPWgYvSvIVJ52l6ruIQQHFsElIw8I9FdR-cgHNep_pOgHEbRIbCs4Ll40cVAy9WfuHLSLoDD0h97-NIlh2oxBEcUY8-BvOUQEGxK26Zg8EN88JuI6t_QfTIpo4o8SEvozI2aArxijJ1jpmjMSaLe1YTLlULjTO29kH_NNRj5TCel7L6jonJSKxAd4lT_LS-XUaDX_rUuP7SmV1OismRo",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  "kol-010": {
    id: "kol-010",
    name: "An Phương",
    avatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_khcI6eId3tpCsZ-AXUyGyvnysHXrAFMdJZ4SDNn1E=s900-c-k-c0x00ffffff-no-rj",
    niche: "Đời sống",
    rating: 4.85,
    ratingCount: 750,
    reach: formatReach(987_000),
    isVerified: true,
    reviewQuote:
      "Mình rất thích cách sản phẩm này blend vào cuộc sống hàng ngày. Đơn giản, hiệu quả, và rất đáng để đầu tư cho bản thân.",
    videoThumbnailUrl:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
};

/* ───────── Comments ───────── */

export const CERTIFICATE_COMMENTS: CertificateComment[] = [
  {
    id: "cmt-001",
    authorName: "Nguyễn Thị Mai",
    authorAvatarUrl:
      "https://yt3.googleusercontent.com/3OEPSJcC1pjZpre5w2kXpwL8sX-jUGsvpC5CukZUc324yE-dqpMi8LUrNJbv9dua3eTy7Vuf=s900-c-k-c0x00ffffff-no-rj",
    content:
      "Mình mua sau khi xem video review và sản phẩm đúng y như mô tả. Rất hài lòng!",
    createdAt: "2026-04-20T10:30:00Z",
  },
  {
    id: "cmt-002",
    authorName: "Trần Minh Đức",
    authorAvatarUrl:
      "https://yt3.googleusercontent.com/EFB13mILKGh6KbJnTUayPFRw11s4iKhz6GtpbfTl2AAwmUo0FFB2jbxpOup4j5w0gAhYKyqudR4=s900-c-k-c0x00ffffff-no-rj",
    content:
      "Sản phẩm tuyệt vời! Cảm ơn review chân thực. Đã đặt hàng cho cả gia đình.",
    createdAt: "2026-04-15T08:15:00Z",
  },
  {
    id: "cmt-003",
    authorName: "Lê Hoàng Anh",
    authorAvatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_nwiNWEuXX3dEwPZFkJgPN1-kxEIhQs5dbSUv0WaSWuxA=s900-c-k-c0x00ffffff-no-rj",
    content:
      "Đã dùng được 1 tháng, chất lượng ổn định. Size chuẩn, không cần đổi trả.",
    createdAt: "2026-04-10T14:45:00Z",
  },
  {
    id: "cmt-004",
    authorName: "Phạm Quỳnh Trang",
    authorAvatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_k1rGK0MkQwNSIequknZ7b8WabTnjqvEfN1Stb7yGHmQlA=s900-c-k-c0x00ffffff-no-rj",
    content:
      "Giao hàng nhanh, đóng gói cẩn thận. Sản phẩm chính hãng được xác nhận bởi Hive-K 💯",
    createdAt: "2026-04-08T16:20:00Z",
  },
  {
    id: "cmt-005",
    authorName: "Đỗ Văn Hùng",
    authorAvatarUrl:
      "https://yt3.googleusercontent.com/WEHCMR1Ri0GwRRsUJjvkNL65xbMmP9E82StTxx81p07hAIafEtYYFtEHjyenUEW3iK1BcF6X=s900-c-k-c0x00ffffff-no-rj",
    content:
      "Lần đầu mua qua link KOL và không thất vọng. Sẽ tiếp tục ủng hộ!",
    createdAt: "2026-04-05T09:00:00Z",
  },
  {
    id: "cmt-006",
    authorName: "Vũ Thị Hương",
    authorAvatarUrl:
      "https://yt3.googleusercontent.com/ytc/AIdro_nJMB_RTSkLUoHs6qCcbM7EjaZ7UR0eqsHraJVS-mB2Jg=s900-c-k-c0x00ffffff-no-rj",
    content:
      "Thấy badge xác nhận từ Hive nên yên tâm mua. Sản phẩm đẹp, chất lượng tốt hơn kỳ vọng.",
    createdAt: "2026-04-02T11:30:00Z",
  },
];

/* ───────── Perks (trust badges) ───────── */

export const CERTIFICATE_PERKS: CertificatePerk[] = [
  { icon: "local_shipping", label: "Miễn phí vận chuyển & đổi trả" },
  { icon: "verified", label: "Xác nhận chính hãng bởi Hive-K" },
];
