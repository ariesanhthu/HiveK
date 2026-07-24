import {
  type AgentStep,
  type Campaign,
  type CampaignPlanningData,
  type CampaignPost,
  type SocialAccount,
} from '@/features/campaign-planning/types/campaign-planning';

const CAMPAIGNS: Campaign[] = [
  {
    id: 'tutorx-better-every-hour',
    name: 'Better Every Hour · Kế hoạch 90 ngày',
    status: 'draft',
    description:
      'Chuỗi nội dung giúp học sinh tiến bộ theo từng giờ học và giúp phụ huynh nhìn thấy lộ trình rõ ràng.',
  },
  {
    id: 'tutorx-back-to-school',
    name: 'Back to School 2026',
    status: 'ready',
    description:
      'Chiến dịch đầu năm học với nội dung chẩn đoán năng lực, xây lộ trình và kết nối gia sư phù hợp.',
  },
  {
    id: 'tutorx-parent-insight',
    name: 'Phụ huynh đồng hành đúng cách',
    status: 'scheduled',
    description:
      'Chuỗi nội dung giải đáp băn khoăn của phụ huynh và hướng dẫn cách theo dõi tiến bộ học tập.',
  },
];

const ACCOUNTS: SocialAccount[] = [
  { id: 'fb-tutorx', platform: 'facebook', name: 'The TutorX Việt Nam' },
  {
    id: 'fb-tutorx-community',
    platform: 'facebook',
    name: 'Học tốt cùng The TutorX',
  },
  { id: 'threads-tutorx', platform: 'threads', name: '@thetutorx.vn' },
  { id: 'threads-study', platform: 'threads', name: '@tutorx.study' },
  { id: 'tiktok-tutorx', platform: 'tiktok', name: '@thetutorx' },
  {
    id: 'tiktok-study',
    platform: 'tiktok',
    name: '@tutorx.studyhabits',
  },
];

const POSTS: CampaignPost[] = [
  {
    id: 'post-01',
    day: 1,
    dateLabel: '20/07',
    time: '09:00',
    title: 'Mỗi giờ học đều có thể tốt hơn',
    goal: 'Nhận diện thương hiệu',
    platform: 'facebook',
    accountId: 'fb-tutorx',
    content:
      'Tiến bộ không nhất thiết bắt đầu từ một thay đổi thật lớn. Đôi khi, đó chỉ là một giờ học đúng trọng tâm, một người hướng dẫn phù hợp và một mục tiêu đủ rõ ràng. The TutorX đồng hành để mỗi giờ học của bạn đều tạo ra giá trị. Better Every Hour.',
    firstComment:
      'Bạn đang muốn cải thiện môn học nào? Để lại môn và lớp, TutorX sẽ gợi ý điểm bắt đầu phù hợp.',
    suggestedReplies: [
      'TutorX đã ghi nhận, đội ngũ sẽ tư vấn lộ trình phù hợp nhé.',
      'Bạn có thể inbox kết quả gần nhất để được hỗ trợ kỹ hơn.',
      'Mỗi học sinh sẽ có một lộ trình riêng, mình cùng bắt đầu nhé!',
    ],
    mediaPrompt:
      'Key visual học sinh Việt Nam học cùng gia sư, ánh sáng ấm, bàn học gọn gàng, nhấn mạnh thông điệp Better Every Hour.',
    status: 'needs-review',
    reviewer: 'Brand Lead',
    reviewNote: 'Kiểm tra lại cách đặt CTA để ưu tiên tư vấn thay vì bán hàng trực tiếp.',
    scheduledAt: '2026-07-20T09:00',
    hashtags: ['#TheTutorX', '#BetterEveryHour', '#HocDungCach'],
  },
  {
    id: 'post-02',
    day: 1,
    dateLabel: '20/07',
    time: '20:00',
    title: '3 dấu hiệu con đang cần một lộ trình mới',
    goal: 'Thu hút phụ huynh',
    platform: 'facebook',
    accountId: 'fb-tutorx-community',
    content:
      'Điểm số chưa phản ánh hết khó khăn của con. Ba dấu hiệu đáng chú ý là: học nhiều nhưng không biết mình yếu ở đâu, dễ mất động lực sau một bài kiểm tra và không thể tự giải thích cách làm. Một buổi chẩn đoán đúng sẽ giúp phụ huynh nhìn thấy vấn đề trước khi chọn giải pháp.',
    firstComment:
      'Bình luận “LỘ TRÌNH” để nhận checklist 5 câu hỏi giúp phụ huynh xác định nhu cầu học tập của con.',
    suggestedReplies: [
      'TutorX gửi checklist cho phụ huynh ngay nhé.',
      'Mình có thể chia sẻ thêm lớp và môn con đang gặp khó khăn.',
      'Đội ngũ sẽ hỗ trợ phụ huynh đọc kết quả chẩn đoán.',
    ],
    mediaPrompt:
      'Carousel 4 trang dành cho phụ huynh, bố cục sạch, màu vàng cam và tím theo nhận diện The TutorX.',
    mediaAsset: 'Carousel · 3 dấu hiệu cần thay đổi lộ trình',
    status: 'approved',
    reviewer: 'Academic Advisor',
    reviewNote: 'Thông điệp phù hợp, giữ cách diễn đạt không gây áp lực cho phụ huynh.',
    scheduledAt: '2026-07-20T20:00',
    hashtags: ['#DongHanhCungCon', '#LoTrinhHocTap', '#TheTutorX'],
  },
  {
    id: 'post-03',
    day: 2,
    dateLabel: '21/07',
    time: '11:30',
    title: 'Học nhiều chưa chắc học đúng',
    goal: 'Tạo thảo luận',
    platform: 'threads',
    accountId: 'threads-tutorx',
    content:
      'Học thêm 2 giờ chưa chắc hiệu quả bằng 45 phút biết rõ: mình đang hổng kiến thức nào, cần luyện dạng bài gì và kết quả hôm nay phải tốt hơn ở điểm nào.',
    firstComment: 'Bạn thấy phần nào khó nhất: bắt đầu, duy trì tập trung hay tự kiểm tra?',
    suggestedReplies: [
      'Bắt đầu từ một mục tiêu nhỏ trong 45 phút nhé.',
      'TutorX có mẫu tự kiểm tra cuối buổi học, mình gửi bạn nha.',
      'Khó tập trung thường cần đổi cách chia phiên học trước tiên.',
    ],
    mediaPrompt: 'Bài text-only, ưu tiên câu mở đầu ngắn và một câu hỏi khuyến khích phản hồi.',
    status: 'draft',
    reviewer: 'Content Strategist',
    reviewNote: '',
    scheduledAt: '2026-07-21T11:30',
    hashtags: ['#StudyTips', '#BetterEveryHour'],
  },
  {
    id: 'post-04',
    day: 3,
    dateLabel: '22/07',
    time: '19:30',
    title: 'Kỹ thuật 10 phút khởi động buổi học',
    goal: 'Tăng lượt lưu',
    platform: 'tiktok',
    accountId: 'tiktok-study',
    content:
      '10 phút đầu quyết định chất lượng cả buổi học: 2 phút dọn bàn, 3 phút nhắc lại kiến thức cũ, 3 phút đặt một mục tiêu và 2 phút chọn bài đầu tiên. Bắt đầu nhỏ để vào guồng nhanh hơn.',
    firstComment: 'Lưu video và thử áp dụng trước buổi học tiếp theo nhé.',
    suggestedReplies: [
      'Bạn muốn TutorX làm template kế hoạch 45 phút không?',
      'Bước nhắc lại kiến thức cũ rất dễ bị bỏ qua đó!',
      'Thử trong 3 ngày rồi quay lại chia sẻ kết quả nhé.',
    ],
    mediaPrompt:
      'Video dọc 20 giây, góc quay top-down bàn học, timer nổi bật, chuyển cảnh nhanh theo 4 bước.',
    status: 'needs-review',
    reviewer: 'Video Lead',
    reviewNote: 'Cần thêm hook trực quan trong 2 giây đầu và phụ đề cho toàn bộ video.',
    scheduledAt: '2026-07-22T19:30',
    hashtags: ['#StudyWithTutorX', '#StudyRoutine', '#HocTapHieuQua'],
  },
  {
    id: 'post-05',
    day: 4,
    dateLabel: '23/07',
    time: '09:30',
    title: 'Một gia sư phù hợp được chọn như thế nào?',
    goal: 'Xây dựng niềm tin',
    platform: 'facebook',
    accountId: 'fb-tutorx',
    content:
      'Một gia sư phù hợp không chỉ giỏi môn học. TutorX xem xét mục tiêu, khoảng trống kiến thức, cách tiếp thu và lịch học của từng học sinh trước khi đề xuất người đồng hành. Việc ghép đúng ngay từ đầu giúp buổi học tập trung hơn và tiến bộ có thể theo dõi được.',
    firstComment: 'Đăng ký trao đổi nhu cầu để TutorX hỗ trợ xác định tiêu chí gia sư phù hợp.',
    suggestedReplies: [
      'Đội ngũ sẽ hỏi kỹ nhu cầu trước khi đề xuất gia sư.',
      'Phụ huynh có thể yêu cầu đổi nếu cách học chưa phù hợp.',
      'TutorX sẽ gửi thông tin gia sư để gia đình xem trước.',
    ],
    mediaPrompt:
      'Infographic quy trình 4 bước ghép gia sư, hình ảnh chuyên nghiệp, thân thiện và minh bạch.',
    status: 'approved',
    reviewer: 'Operations Lead',
    reviewNote: 'Đã kiểm tra quy trình, tránh dùng tuyên bố đảm bảo kết quả tuyệt đối.',
    scheduledAt: '2026-07-23T09:30',
    hashtags: ['#GiaSuChatLuong', '#TheTutorX', '#HocTapCaNhanHoa'],
  },
  {
    id: 'post-06',
    day: 5,
    dateLabel: '24/07',
    time: '20:30',
    title: 'FAQ: Buổi học đầu tiên diễn ra thế nào?',
    goal: 'Giảm rào cản đăng ký',
    platform: 'threads',
    accountId: 'threads-study',
    content:
      'Buổi đầu tiên không phải để học thật nhiều. Đây là lúc gia sư hiểu mục tiêu, quan sát cách học, xác định phần kiến thức cần ưu tiên và thống nhất cách theo dõi tiến bộ cùng học sinh.',
    firstComment: 'Bạn còn băn khoăn điều gì trước khi bắt đầu học cùng gia sư?',
    suggestedReplies: [
      'Bạn có thể chia sẻ trước mục tiêu để buổi đầu hiệu quả hơn.',
      'Phụ huynh sẽ nhận được ghi nhận sau buổi học.',
      'Lịch học có thể được thống nhất theo thời gian phù hợp của hai bên.',
    ],
    mediaPrompt: 'Thread text-only gồm bài chính và 3 phản hồi giải đáp ngắn.',
    status: 'draft',
    reviewer: 'Customer Success',
    reviewNote: '',
    scheduledAt: '2026-07-24T20:30',
    hashtags: ['#TutorXFAQ', '#HocCungGiaSu'],
  },
];

const AGENT_STEPS: AgentStep[] = [
  { id: 'read-input', label: 'Đọc hồ sơ The TutorX và chiến lược 90 ngày', status: 'done' },
  { id: 'understand-goal', label: 'Đối chiếu mục tiêu, phụ huynh và học sinh', status: 'done' },
  { id: 'build-plan', label: 'Phân bổ trụ cột nội dung theo từng kênh', status: 'active' },
  { id: 'write-content', label: 'Soạn nội dung và CTA cho từng bài', status: 'queued' },
  { id: 'brand-check', label: 'Kiểm tra giọng thương hiệu và tuyên bố', status: 'queued' },
  { id: 'schedule', label: 'Chuẩn bị lịch duyệt và đăng bài', status: 'queued' },
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
