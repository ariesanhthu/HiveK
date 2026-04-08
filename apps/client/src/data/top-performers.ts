export type TopPerformerRow = {
  id: string;
  avatar: string;
  name: string;
  handle: string;
  category: string;
  engagement: string;
  engagementPercent: number;
  followers: string;
  trend: "up" | "flat";
};

export const TOP_PERFORMERS: TopPerformerRow[] = [
  {
    id: "kol-004",
    avatar:
      "https://yt3.googleusercontent.com/EFB13mILKGh6KbJnTUayPFRw11s4iKhz6GtpbfTl2AAwmUo0FFB2jbxpOup4j5w0gAhYKyqudR4=s900-c-k-c0x00ffffff-no-rj",
    name: "Khoai Lang Thang",
    handle: "@Khoailangthang",
    category: "Du lịch & Ẩm thực",
    engagement: "10.1%",
    engagementPercent: 100,
    followers: "2.7M",
    trend: "up",
  },
  {
    id: "kol-008",
    avatar:
      "https://yt3.googleusercontent.com/ytc/AIdro_nwiNWEuXX3dEwPZFkJgPN1-kxEIhQs5dbSUv0WaSWuxA=s900-c-k-c0x00ffffff-no-rj",
    name: "Sun HT",
    handle: "@SunHT",
    category: "Fitness & Lifestyle",
    engagement: "9.8%",
    engagementPercent: 86,
    followers: "1.2M",
    trend: "up",
  },
  {
    id: "kol-003",
    avatar:
      "https://yt3.googleusercontent.com/3OEPSJcC1pjZpre5w2kXpwL8sX-jUGsvpC5CukZUc324yE-dqpMi8LUrNJbv9dua3eTy7Vuf=s900-c-k-c0x00ffffff-no-rj",
    name: "Giang Ơi",
    handle: "@GiangOi",
    category: "Đời sống",
    engagement: "9.2%",
    engagementPercent: 82,
    followers: "2.2M",
    trend: "up",
  },
  {
    id: "kol-001",
    avatar:
      "https://yt3.googleusercontent.com/YaAFWY03ER0DfF77HAyMqNlRxmJiSEDq_I7ZF0MlcgRcVzOhIhZfB8QlwNhAuVXZesi2I2zy=s900-c-k-c0x00ffffff-no-rj",
    name: "MixiGaming",
    handle: "@mixigaming3con",
    category: "Gaming",
    engagement: "8.4%",
    engagementPercent: 74,
    followers: "8.2M",
    trend: "up",
  },
];
