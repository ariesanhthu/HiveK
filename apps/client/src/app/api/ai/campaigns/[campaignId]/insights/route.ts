import { NextResponse, type NextRequest } from "next/server";
import { generateInsightWorkflow } from "@/server/ai/workflows/generate-insight.workflow";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params;
  const response = await generateInsightWorkflow(campaignId);

  return NextResponse.json(response);
}
