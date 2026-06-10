import { NextResponse, type NextRequest } from "next/server";
import { saveFeedbackRequestSchema } from "@/server/ai/schemas/agent.schemas";
import { saveFeedbackWorkflow } from "@/server/ai/workflows/save-feedback.workflow";

export async function POST(request: NextRequest) {
  const body = saveFeedbackRequestSchema.parse(await request.json());
  const response = await saveFeedbackWorkflow(body);

  return NextResponse.json(response);
}
