import type {
  AiState,
  ChannelCapabilities,
  ConversationPriority,
  ConversationStatus,
  HandlingMode,
  InboxChannel,
  InboxConversation,
  InboxMessage,
} from "@/features/inbox/types";

const ACTIVE: ChannelCapabilities = {
  canSendText: true,
  canSendAttachments: true,
  canOpenNativeConversation: true,
  canUseAutomation: true,
  permissionStatus: "active",
  replyWindowExpiresAt: "2026-07-15T18:30:00+07:00",
};

const READ_ONLY: ChannelCapabilities = {
  canSendText: false,
  canSendAttachments: false,
  canOpenNativeConversation: true,
  canUseAutomation: false,
  permissionStatus: "read_only",
  policyNotice: "Kênh này đang ở chế độ chỉ đọc. Hãy trả lời trên nền tảng gốc.",
};

const EXPIRED: ChannelCapabilities = {
  ...READ_ONLY,
  permissionStatus: "expired",
  policyNotice: "Quyền nhắn tin đã hết hạn. Quản trị viên cần kết nối lại tài khoản.",
};

function message(
  id: string,
  authorType: InboxMessage["authorType"],
  authorName: string,
  content: string,
  createdAt: string,
  extra: Partial<InboxMessage> = {}
): InboxMessage {
  return {
    id,
    authorType,
    authorName,
    content,
    createdAt,
    deliveryStatus: "delivered",
    ...extra,
  };
}

type Seed = {
  id: string;
  name: string;
  initials: string;
  username: string;
  location: string;
  intent: string;
  leadStage: string;
  channel: InboxChannel;
  accountName: string;
  status: ConversationStatus;
  priority?: ConversationPriority;
  unread?: number;
  assignee?: string;
  handlingMode?: HandlingMode;
  aiState?: AiState;
  tags: string[];
  sourceContext: string;
  capabilities?: ChannelCapabilities;
  handoffReason?: string;
  messages: InboxMessage[];
};

function conversation(seed: Seed): InboxConversation {
  const last = seed.messages.at(-1)!;
  return {
    id: seed.id,
    customer: {
      name: seed.name,
      initials: seed.initials,
      username: seed.username,
      location: seed.location,
      intent: seed.intent,
      leadStage: seed.leadStage,
    },
    channel: seed.channel,
    accountName: seed.accountName,
    status: seed.status,
    priority: seed.priority ?? "normal",
    unreadCount: seed.unread ?? 0,
    lastMessageAt: last.createdAt,
    assignee: seed.assignee ?? "Chưa phân công",
    handlingMode: seed.handlingMode ?? "limited_auto",
    aiState: seed.aiState ?? "active",
    tags: seed.tags,
    preview: last.content,
    sourceContext: seed.sourceContext,
    capabilities: seed.capabilities ?? ACTIVE,
    messages: seed.messages,
    handoffReason: seed.handoffReason,
  };
}

export const MOCK_INBOX_CONVERSATIONS: InboxConversation[] = [
  conversation({
    id: "conv-minh-anh",
    name: "Minh Anh",
    initials: "MA",
    username: "minhanh.nguyen",
    location: "TP. Hồ Chí Minh",
    intent: "Tìm gia sư Toán lớp 8",
    leadStage: "Phụ huynh cần tư vấn",
    channel: "messenger",
    accountName: "HIVE-K Gia Sư",
    status: "needs_human",
    priority: "urgent",
    unread: 2,
    aiState: "blocked_conflict",
    assignee: "Anh Thư",
    tags: ["Toán lớp 8", "Phú Nhuận"],
    sourceContext: "Bài viết: Tìm gia sư phù hợp trong 24 giờ",
    handoffReason: "Hai mức học phí 180.000đ và 220.000đ/buổi đang cùng hiệu lực.",
    messages: [
      message("m1", "customer", "Minh Anh", "Mình cần tìm gia sư Toán lớp 8, học tại nhà ở Phú Nhuận.", "2026-07-15T09:18:00+07:00"),
      message("m2", "ai_agent", "AI Agent", "Mình đã tìm được 3 gia sư phù hợp lịch tối thứ 3 và thứ 5. Mình đang kiểm tra lại học phí trước khi gửi bạn.", "2026-07-15T09:19:00+07:00", {
        isAutomated: true,
        confidence: "high",
        evidence: ["3 hồ sơ gia sư Toán đã xác minh · khu vực Phú Nhuận"],
      }),
      message("m3", "customer", "Minh Anh", "Phí là 180 nghìn hay 220 nghìn một buổi vậy bạn?", "2026-07-15T09:22:00+07:00"),
      message("m4", "system", "Hệ thống", "AI đã dừng và chuyển cho người thật do bảng phí gia sư đang mâu thuẫn.", "2026-07-15T09:22:10+07:00"),
    ],
  }),
  conversation({
    id: "conv-thao-vy",
    name: "Thảo Vy",
    initials: "TV",
    username: "thaovy.study",
    location: "Đà Nẵng",
    intent: "Tư vấn chọn gia sư IELTS",
    leadStage: "Phụ huynh mới",
    channel: "instagram",
    accountName: "HIVE-K Gia Sư",
    status: "open",
    unread: 1,
    aiState: "handoff_requested",
    assignee: "Anh Thư",
    tags: ["IELTS", "Gia sư nữ"],
    sourceContext: "Instagram Reel: Cách chọn gia sư IELTS phù hợp",
    handoffReason: "Phụ huynh muốn trao đổi trực tiếp về yêu cầu riêng với tư vấn viên.",
    messages: [
      message("m5", "customer", "Thảo Vy", "Mình muốn tìm gia sư nữ dạy IELTS cho em lớp 11, bên bạn tư vấn giúp mình nhé.", "2026-07-15T08:54:00+07:00"),
    ],
  }),
  conversation({
    id: "conv-quoc-huy",
    name: "Quốc Huy",
    initials: "QH",
    username: "huy.learns",
    location: "Hà Nội",
    intent: "Tìm gia sư Vật lý lớp 10",
    leadStage: "Đã ghép gia sư",
    channel: "messenger",
    accountName: "HIVE-K Gia Sư Hà Nội",
    status: "waiting_for_customer",
    aiState: "active",
    tags: ["Vật lý 10", "Cầu Giấy"],
    sourceContext: "Quảng cáo: Ghép gia sư theo lịch học của bạn",
    messages: [
      message("m6", "customer", "Quốc Huy", "Có gia sư Vật lý lớp 10 học tối thứ 2, 4 không?", "2026-07-15T08:30:00+07:00"),
      message("m7", "ai_agent", "AI Agent", "Có 2 gia sư tại Cầu Giấy phù hợp lịch tối thứ 2, 4. Bạn muốn mình gửi hồ sơ để chọn buổi học thử không?", "2026-07-15T08:31:00+07:00", {
        isAutomated: true,
        confidence: "high",
        evidence: ["Lịch rảnh và hồ sơ xác minh của 2 gia sư Vật lý"],
      }),
    ],
  }),
  conversation({
    id: "conv-linh-chi",
    name: "Linh Chi",
    initials: "LC",
    username: "linhchi.travel",
    location: "Lâm Đồng",
    intent: "Ứng tuyển lớp Toán 9",
    leadStage: "Gia sư mới",
    channel: "messenger",
    accountName: "HIVE-K Việc làm Gia sư",
    status: "needs_human",
    priority: "high",
    unread: 3,
    aiState: "blocked_missing_data",
    tags: ["Báo lớp", "Toán 9"],
    sourceContext: "Bài đăng: Lớp Toán 9 tại Đà Lạt cần gia sư",
    handoffReason: "Chưa xác nhận lớp còn nhận ứng viên và lịch học cuối tuần.",
    messages: [message("m8", "customer", "Linh Chi", "Em thấy lớp Toán 9 ở Đà Lạt, lớp còn tuyển gia sư không ạ?", "2026-07-15T08:12:00+07:00")],
  }),
  conversation({
    id: "conv-gia-bao",
    name: "Gia Bảo",
    initials: "GB",
    username: "baomarketing",
    location: "Cần Thơ",
    intent: "Tìm job gia sư Hóa",
    leadStage: "Gia sư đã xác minh",
    channel: "instagram",
    accountName: "HIVE-K Việc làm Gia sư",
    status: "open",
    unread: 1,
    aiState: "suggestion_only",
    handlingMode: "suggestion_only",
    assignee: "Anh Thư",
    tags: ["Xin việc", "Hóa THPT"],
    sourceContext: "Instagram Story: Danh sách lớp gia sư mới hôm nay",
    messages: [message("m9", "customer", "Gia Bảo", "Em là sinh viên Sư phạm Hóa, hiện có job dạy Hóa cấp 3 ở Cần Thơ không ạ?", "2026-07-15T07:48:00+07:00")],
  }),
  conversation({
    id: "conv-hoang-nam",
    name: "Hoàng Nam",
    initials: "HN",
    username: "nam.hoang",
    location: "TP. Hồ Chí Minh",
    intent: "Hỏi phí nhận lớp",
    leadStage: "Gia sư đang nhận lớp",
    channel: "messenger",
    accountName: "HIVE-K Việc làm Gia sư",
    status: "needs_human",
    priority: "high",
    unread: 1,
    aiState: "handoff_requested",
    tags: ["Phí nhận lớp", "Khiếu nại"],
    sourceContext: "Job #GS-2084 · Toán lớp 12 tại Quận 3",
    handoffReason: "Khiếu nại về phí nhận lớp cần nhân viên kiểm tra giao dịch.",
    messages: [message("m10", "customer", "Hoàng Nam", "Mình đã đóng phí nhận lớp nhưng phụ huynh đổi lịch, bên bạn hỗ trợ giúp mình nhé.", "2026-07-14T22:10:00+07:00")],
  }),
  conversation({
    id: "conv-khanh-ly",
    name: "Khánh Ly",
    initials: "KL",
    username: "lykhanh",
    location: "Bình Dương",
    intent: "Xem hồ sơ gia sư",
    leadStage: "Phụ huynh đã nhận hồ sơ",
    channel: "messenger",
    accountName: "HIVE-K Gia Sư",
    status: "waiting_for_customer",
    aiState: "active",
    tags: ["Tiếng Anh 6", "Học tại nhà"],
    sourceContext: "Yêu cầu ghép gia sư #PH-1042",
    messages: [
      message("m11", "customer", "Khánh Ly", "Gia sư Nguyễn Thu Hà có kinh nghiệm dạy học sinh lớp 6 chưa?", "2026-07-14T20:22:00+07:00"),
      message("m12", "ai_agent", "AI Agent", "Bạn Hà có 2 năm dạy Tiếng Anh THCS và đã hoàn thành 18 lớp trên HIVE-K với đánh giá 4,9/5.", "2026-07-14T20:23:00+07:00", { isAutomated: true, confidence: "high", evidence: ["Hồ sơ gia sư Nguyễn Thu Hà · đã xác minh"] }),
    ],
  }),
  conversation({
    id: "conv-tu-uyen",
    name: "Tú Uyên",
    initials: "TU",
    username: "uyen.tu",
    location: "Huế",
    intent: "Hỏi job gia sư mới",
    leadStage: "Gia sư mới",
    channel: "threads",
    accountName: "HIVE-K Việc làm Gia sư · Threads",
    status: "open",
    aiState: "active",
    tags: ["Xin việc", "Ngữ văn"],
    sourceContext: "Threads · phản hồi được đồng bộ ở chế độ chỉ đọc",
    capabilities: READ_ONLY,
    messages: [message("m13", "customer", "Tú Uyên", "Bên mình có lớp Ngữ văn cấp 2 ở Huế cần gia sư không ạ?", "2026-07-14T18:45:00+07:00")],
  }),
  conversation({
    id: "conv-bao-tran",
    name: "Bảo Trân",
    initials: "BT",
    username: "tranbao",
    location: "Nha Trang",
    intent: "Hỏi trạng thái ứng tuyển",
    leadStage: "Gia sư đang chờ duyệt",
    channel: "messenger",
    accountName: "HIVE-K Gia Sư · tài khoản cũ",
    status: "open",
    aiState: "paused_by_user",
    handlingMode: "human",
    assignee: "Minh Khang",
    tags: ["Ứng tuyển", "Tiếng Anh"],
    sourceContext: "Ứng tuyển job #GS-2048",
    capabilities: EXPIRED,
    messages: [message("m14", "customer", "Bảo Trân", "Hồ sơ ứng tuyển lớp Tiếng Anh 8 của mình đã được phụ huynh xem chưa ạ?", "2026-07-14T17:12:00+07:00")],
  }),
  conversation({
    id: "conv-duc-anh",
    name: "Đức Anh",
    initials: "DA",
    username: "anhduc.edu",
    location: "Hải Phòng",
    intent: "Đăng ký làm gia sư",
    leadStage: "Đã nộp hồ sơ",
    channel: "messenger",
    accountName: "HIVE-K Việc làm Gia sư",
    status: "resolved",
    aiState: "active",
    tags: ["Đăng ký gia sư"],
    sourceContext: "Facebook Page HIVE-K Gia Sư",
    messages: [message("m15", "ai_agent", "AI Agent", "Bạn đăng ký hồ sơ gia sư tại hivek.vn/gia-su/dang-ky, sau đó tải lên thẻ sinh viên và bằng cấp liên quan nhé.", "2026-07-14T15:05:00+07:00", { isAutomated: true })],
  }),
  conversation({
    id: "conv-phuong-nhi",
    name: "Phương Nhi",
    initials: "PN",
    username: "nhiphuong",
    location: "Đà Lạt",
    intent: "Giữ lớp chờ xác nhận",
    leadStage: "Gia sư được đề xuất",
    channel: "messenger",
    accountName: "HIVE-K Việc làm Gia sư",
    status: "snoozed",
    aiState: "paused_by_user",
    handlingMode: "human",
    assignee: "Anh Thư",
    tags: ["Follow-up"],
    sourceContext: "Job #GS-2051 · Tiếng Việt lớp 3",
    messages: [message("m16", "current_user", "Anh Thư", "Mình đã giữ lớp Tiếng Việt lớp 3 đến 18:00 hôm nay để bạn xác nhận lịch nhé.", "2026-07-14T14:40:00+07:00")],
  }),
  conversation({
    id: "conv-my-duyen",
    name: "Mỹ Duyên",
    initials: "MD",
    username: "duyen.creator",
    location: "TP. Hồ Chí Minh",
    intent: "Hỏi vòng dạy thử",
    leadStage: "Gia sư đã xác minh",
    channel: "instagram",
    accountName: "HIVE-K Việc làm Gia sư",
    status: "resolved",
    aiState: "active",
    tags: ["Dạy thử", "Tiếng Anh"],
    sourceContext: "Instagram Reel: Quy trình nhận lớp tại HIVE-K",
    messages: [message("m17", "ai_agent", "AI Agent", "Sau khi hồ sơ được xác minh, bạn sẽ có một buổi dạy thử 20 phút trước khi nhận lớp chính thức.", "2026-07-13T16:20:00+07:00", { isAutomated: true, confidence: "high", evidence: ["Quy trình nhận lớp gia sư · phiên bản 3"] })],
  }),
];
