import type { CampaignListItem } from "@/features/campaigns/types";

export const ACTIVE_CAMPAIGNS: CampaignListItem[] = [
  {
    id: "summer-glow-skincare",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80&auto=format&fit=crop",
    category: "Chăm sóc da",
    title: "Chiến dịch Dưỡng da Mùa hè Toả sáng",
    priceRange: "$8,000 - $15,000",
    status: "active",
  },
  {
    id: "nike-future-speed-run",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBSwjmWA007lPftgh2qO-ZPcC_mzJl1FpPS4C6ghQVU3NWtROXP4gAThNxOPWgYvSvIVJ52l6ruIQQHFsElIw8I9FdR-cgHNep_pOgHEbRIbCs4Ll40cVAy9WfuHLSLoDD0h97-NIlh2oxBEcUY8-BvOUQEGxK26Zg8EN88JuI6t_QfTIpo4o8SEvozI2aArxijJ1jpmjMSaLe1YTLlULjTO29kH_NNRj5TCel7L6jonJSKxAd4lT_LS-XUaDX_rUuP7SmV1OismRo",
    category: "Giày dép",
    title: "Nike: Tốc độ Tương lai",
    priceRange: "$2,500 - $5,000",
    status: "active",
  },
  {
    id: "soundmaster-pro-review",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD4gDyTExo7JHPJhFGLA1XGBMAAGr1hVcrRQY8l5v2tQEIE9C6dyQOKIzF47f-yi5tukgIiPoOv0PL9eV2HfNri99JLKbncAHxXUl8GceBmeg6SSapfuATebfqUUZC9yKbcIltw-hm1j3UfWdQ4uTrIJsJ7lI_P_-FXsgTYqtqtHb8Ih5l3pK41FsHdjkX1Zi1sapXdJAC933HGqEF5YenG-i8TyQ_F3eXjz0WHGPHNeusvCfGKvEot-URRCeIEeM80s97Q-zb0bcg",
    category: "Điện tử",
    title: "Review Hệ thống Âm thanh Pro",
    priceRange: "$1,200 - $3,000",
    status: "active",
  },
  {
    id: "elite-chrono-collection",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCx6Vdn_4jBlqNYfFDAPiJdPNNYoCabdh19H7HPUNtiHdn2cDQX24gVnCj-9JWLgyE0ouBjGdKwcaPFKDOfzz2Yc6qaRMLspmCAzUxIb23g69wGCi6gLzf3A0oSb01YKsNrx3ALruHI98sC9bpxh9CWcuvNRC-lQMnX70J3IDq14cyG9EsdcLcpIGyd9K6JIEKHSSyGWYKJPpttPbLuBYcj5jbaY7ula4JFzrqtS1h7UVdsd4OSuGWkAwphMjVU_Q_0DDUYMEtltsQ",
    category: "Thời trang cao cấp",
    title: "Bộ sưu tập Elite Chrono",
    priceRange: "$4,000 - $8,000",
    status: "active",
  },
  {
    id: "barista-series-home-hub",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGNFx3ga3X-8637lzaPRAq_1ZHlA7hi7p5b7GWKOJQoVbyqT0sAppFzUJhqr9PSwqXA2PxZC0g6x4N6uKb3jQ5AbrcUMBDMDXbwRaKJA6MbHhenSmsm5zG_HfPH8OaZnSWjx5o8zhVefYq0Z3z6fdQdsclsyjMb8RazsTvcHhXc7UbIt09Yw5kjrhyuZegRVS-pcj0PGtxtiHggrAekejcpTL9UgATYK1vByWBYMP1_rN8d0NmLwNUxn2CDP1OyYNjJmtLsVhzD24",
    category: "Đồ gia dụng",
    title: "Trạm pha cà phê Barista Home",
    priceRange: "$800 - $1,500",
    status: "active",
  },
];

export const CAMPAIGN_FILTER_ALL = "all" as const;
