import { NextResponse, type NextRequest } from "next/server";
import { generateSinglePostRequestSchema } from "@/server/ai/schemas/agent.schemas";
import { generateSinglePostWorkflow } from "@/server/ai/workflows/generate-single-post.workflow";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params;
  const body = generateSinglePostRequestSchema.parse(await request.json());
  const response = await generateSinglePostWorkflow(campaignId, body);

  return NextResponse.json(response);
}
