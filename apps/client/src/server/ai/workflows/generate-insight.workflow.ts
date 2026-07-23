import { getCampaignPlanningData } from '@/features/campaign-planning/services/campaign-planning-service';
import { createAgentRunSummary } from '@/server/ai/services/agent-run.service';
import type { CampaignInsightResponse } from '@/server/ai/types/agent.types';
import { getCacheJson, setCacheJson } from '@/server/cache/agentic-cache';

export async function generateInsightWorkflow(
  campaignId: string,
): Promise<CampaignInsightResponse> {
  const cacheKey = `agentic:insight:v2:${campaignId}`;
  const cachedInsight = await getCacheJson<CampaignInsightResponse>(cacheKey);
  if (cachedInsight) return cachedInsight;

  const startedAt = Date.now();
  const data = getCampaignPlanningData();
  const selectedCampaign = data.campaigns.find((campaign) => campaign.id === campaignId)
    ?? data.campaigns[0];
  const approvedCount = data.posts.filter((post) => post.status === 'approved').length;
  const needsReviewCount = data.posts.filter((post) => post.status === 'needs-review').length;

  const response: CampaignInsightResponse = {
    summary: `${
      selectedCampaign?.name ?? campaignId
    } hiện có ${approvedCount} bài đã duyệt và ${needsReviewCount} bài đang chờ người dùng kiểm tra.`,
    whatWorked: [
      'Nội dung dành cho phụ huynh có CTA rõ và mức rủi ro tuyên bố thấp.',
      'Lịch nội dung đã kết hợp nhận diện, xây dựng niềm tin và chuyển đổi tư vấn.',
    ],
    whatDidNotWork: [
      'Một số bài nhận diện vẫn cần ví dụ học tập cụ thể hơn.',
      'Video thói quen học tập cần hook trực quan hơn ở hai giây đầu.',
    ],
    bestAngle: 'Tiến bộ có lộ trình với ví dụ cụ thể cho học sinh và phụ huynh.',
    weakestAngle: 'Thông điệp học tập chung chung, chưa chỉ rõ vấn đề cần giải quyết.',
    kolPerformanceNotes: [
      'Chưa kết nối dữ liệu KOL trực tiếp; hiện chỉ dùng đề xuất matching làm đầu vào tham khảo.',
    ],
    nextCampaignRecommendations: [
      'Ghi nhận phản hồi sau mỗi lần duyệt để Agent học cách diễn đạt của The TutorX.',
      'Gắn trụ cột và giai đoạn hành trình cho từng bài trước khi lên lịch.',
    ],
    dataLimitations: [
      'Các chỉ số hiện dùng dữ liệu demo cho đến khi tài khoản social được kết nối đầy đủ.',
    ],
    agentRun: createAgentRunSummary({
      workflowName: 'generate-insight',
      agentName: 'insight-agent',
      inputSummary: campaignId,
      outputSummary: 'mock insight generated',
      startedAt,
    }),
  };

  await setCacheJson(cacheKey, response);
  return response;
}
