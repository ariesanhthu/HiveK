import { generateCampaignPlanRequestSchema } from '@/server/ai/schemas/agent.schemas';
import { generateCampaignPlanWorkflow } from '@/server/ai/workflows/generate-campaign-plan.workflow';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; }>; },
) {
  const { campaignId } = await params;
  const body = generateCampaignPlanRequestSchema.parse(await request.json());
  const response = await generateCampaignPlanWorkflow(campaignId, body);

  return NextResponse.json(response);
}
