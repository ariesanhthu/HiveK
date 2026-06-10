import {
  type AgentStep,
  type Campaign,
  type CampaignPlanningData,
  type CampaignPost,
  type SocialAccount,
} from "@/features/campaign-planning/types/campaign-planning";

const CAMPAIGNS: Campaign[] = [
  {
    id: "summer-travel",
    name: "Chiến dịch Du lịch Hè",
    status: "draft",
    description: "Chuỗi nội dung khơi gợi cảm hứng du lịch hè cho cộng đồng trẻ.",
  },
  {
    id: "new-product",
    name: "Ra mắt sản phẩm mới",
    status: "ready",
    description: "Kế hoạch launch sản phẩm với bài teasing, social proof và ưu đãi.",
  },
  {
    id: "year-end",
    name: "Sự kiện Cuối năm",
    status: "scheduled",
    description: "Nội dung nhắc lịch, giới thiệu khách mời và tổng kết sự kiện.",
  },
];

const ACCOUNTS: SocialAccount[] = [
  { id: "fb-hive", platform: "facebook", name: "Hive Agency (Official)" },
  { id: "fb-community", platform: "facebook", name: "Hive Travel Community" },
  { id: "threads-hive", platform: "threads", name: "@hiveagency" },
  { id: "threads-team", platform: "threads", name: "@hiveteam" },
  { id: "tiktok-hive", platform: "tiktok", name: "@hive.agency" },
  { id: "tiktok-lab", platform: "tiktok", name: "@hive.contentlab" },
];

const BASE_CONTENT =
  "Khám phá vẻ đẹp tiềm ẩn của mùa hè năm nay với những bí mật chưa từng được bật mí. Bạn đã sẵn sàng để bắt đầu hành trình của mình chưa? #SummerVibes #TravelGoals";

const POSTS: CampaignPost[] = [
  {
    id: "post-01",
    day: 1,
    dateLabel: "15/10",
    time: "09:00",
    title: "Bài viết Nhận diện",
    goal: "Gợi tò mò",
    platform: "facebook",
    accountId: "fb-hive",
    content: BASE_CONTENT,
    firstComment: "Click vào link bio để nhận ngay ưu đãi 20% cho chuyến đi tiếp theo của bạn nhé!",
    suggestedReplies: ["Cảm ơn bạn!", "Check inbox nhé", "Team sẽ gửi lịch trình mẫu ngay"],
    mediaPrompt: "Ảnh lifestyle mùa hè, ánh sáng tự nhiên, nhóm bạn chuẩn bị hành lý.",
    status: "needs-review",
    reviewer: "Marketing Lead",
    reviewNote: "Cần nhấn mạnh ưu đãi và CTA rõ hơn ở cuối bài.",
    scheduledAt: "2026-10-15T09:00",
    hashtags: ["#SummerVibes", "#TravelGoals", "#HiveAgency"],
  },
  {
    id: "post-02",
    day: 1,
    dateLabel: "15/10",
    time: "20:00",
    title: "Bài viết Chứng thực",
    goal: "Tăng tin cậy",
    platform: "facebook",
    accountId: "fb-community",
    content:
      "Một chuyến đi đáng nhớ thường bắt đầu từ lời kể thật. Cùng xem trải nghiệm của khách hàng đã biến kỳ nghỉ hè thành kỷ niệm khó quên như thế nào.",
    firstComment: "Bạn muốn xem full itinerary? Bình luận 'HÈ' để nhận file gợi ý.",
    suggestedReplies: ["Đã gửi bạn nha", "Cảm ơn feedback của bạn", "Inbox team để nhận tư vấn"],
    mediaPrompt: "Ảnh testimonial dạng carousel, khách hàng cười tại resort biển.",
    mediaAsset: "Carousel testimonial khách hàng",
    status: "approved",
    reviewer: "Brand Manager",
    reviewNote: "Thông điệp ổn, giữ social proof ở 2 dòng đầu.",
    scheduledAt: "2026-10-15T20:00",
    hashtags: ["#CustomerStory", "#TravelReview"],
  },
  {
    id: "post-03",
    day: 2,
    dateLabel: "16/10",
    time: "10:30",
    title: "Threads Hook",
    goal: "Kéo thảo luận",
    platform: "threads",
    accountId: "threads-hive",
    content:
      "3 dấu hiệu cho thấy bạn đang chọn sai điểm đến mùa hè: quá đông, lịch trình dày, và không có khoảng nghỉ thật sự.",
    firstComment: "Bạn từng gặp dấu hiệu nào trong 3 điều này?",
    suggestedReplies: ["Điểm này hay nè", "Team gợi ý lịch nhẹ hơn nhé", "Mình đồng ý phần lịch trình"],
    mediaPrompt: "Không cần media, ưu tiên thread ngắn và câu hỏi mở.",
    status: "draft",
    reviewer: "Content Strategist",
    reviewNote: "",
    scheduledAt: "2026-10-16T10:30",
    hashtags: ["#TravelTips"],
  },
  {
    id: "post-04",
    day: 3,
    dateLabel: "17/10",
    time: "18:00",
    title: "TikTok Checklist",
    goal: "Lưu bài",
    platform: "tiktok",
    accountId: "tiktok-hive",
    content:
      "Checklist 15 giây: 5 món nên có trong vali để chuyến hè nhẹ hơn, gọn hơn và ít phát sinh hơn.",
    firstComment: "Lưu video này trước khi đóng vali nhé.",
    suggestedReplies: ["Bạn muốn checklist bản PDF không?", "Món số 4 nhiều người quên lắm", "Team đã ghim link mẫu"],
    mediaPrompt: "Video top-down packing list, caption ngắn, cut nhanh theo nhịp.",
    status: "needs-review",
    reviewer: "Video Lead",
    reviewNote: "Cần thêm shot mở đầu có hook mạnh.",
    scheduledAt: "2026-10-17T18:00",
    hashtags: ["#PackingTips", "#TikTokTravel"],
  },
  {
    id: "post-05",
    day: 4,
    dateLabel: "18/10",
    time: "11:00",
    title: "Ưu đãi nhóm bạn",
    goal: "Chuyển đổi",
    platform: "facebook",
    accountId: "fb-hive",
    content:
      "Đi cùng nhóm bạn thân luôn vui hơn khi mọi thứ đã được chuẩn bị sẵn. Gói hè nhóm 4 người đang mở lịch với số slot giới hạn.",
    firstComment: "Inbox để nhận bảng giá theo số lượng thành viên.",
    suggestedReplies: ["Team gửi bảng giá ngay", "Bạn đi mấy người để mình tư vấn?", "Slot cuối tuần còn ít nha"],
    mediaPrompt: "Ảnh nhóm bạn trên bãi biển, bố cục có khoảng trống cho text offer.",
    status: "approved",
    reviewer: "Sales Lead",
    reviewNote: "CTA rõ, hợp phase chuyển đổi.",
    scheduledAt: "2026-10-18T11:00",
    hashtags: ["#GroupTrip", "#SummerDeal"],
  },
  {
    id: "post-06",
    day: 5,
    dateLabel: "19/10",
    time: "19:30",
    title: "FAQ đặt lịch",
    goal: "Giảm rào cản",
    platform: "threads",
    accountId: "threads-team",
    content:
      "FAQ nhanh: đặt lịch trước bao lâu, đổi ngày có được không, và cần chuẩn bị gì trước khi team tư vấn?",
    firstComment: "Thả câu hỏi còn thiếu, team trả lời ngay trong thread.",
    suggestedReplies: ["Câu này team trả lời ở reply tiếp theo", "Có thể đổi ngày theo chính sách nha"],
    mediaPrompt: "Thread text-only, chia thành 4 reply ngắn.",
    status: "draft",
    reviewer: "Customer Success",
    reviewNote: "",
    scheduledAt: "2026-10-19T19:30",
    hashtags: ["#FAQ", "#TravelPlanning"],
  },
];

const AGENT_STEPS: AgentStep[] = [
  { id: "read-input", label: "Đọc dữ liệu đầu vào (Campaign Input)", status: "done" },
  { id: "understand-goal", label: "Hiểu mục tiêu và đối tượng mục tiêu", status: "done" },
  { id: "build-plan", label: "Lập kế hoạch lộ trình đăng bài", status: "active" },
  { id: "write-content", label: "Tạo nội dung bài viết", status: "queued" },
  { id: "brand-check", label: "Kiểm tra giọng văn thương hiệu", status: "queued" },
  { id: "schedule", label: "Chuẩn bị lịch trình đăng tự động", status: "queued" },
];

export function getCampaignPlanningData(): CampaignPlanningData {
  return {
    campaigns: CAMPAIGNS,
    accounts: ACCOUNTS,
    posts: POSTS,
    agentSteps: AGENT_STEPS,
    agentProgress: 65,
  };
}
