import { generateInsightWorkflow } from '@/server/ai/workflows/generate-insight.workflow';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; }>; },
) {
  const { campaignId } = await params;
  const response = await generateInsightWorkflow(campaignId);

  return NextResponse.json(response);
}
