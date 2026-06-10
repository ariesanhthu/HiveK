import { NextResponse, type NextRequest } from "next/server";
import { validateContentRequestSchema } from "@/server/ai/schemas/agent.schemas";
import { validateContentWorkflow } from "@/server/ai/workflows/validate-content.workflow";

export async function POST(request: NextRequest) {
  const body = validateContentRequestSchema.parse(await request.json());
  const response = await validateContentWorkflow(body);

  return NextResponse.json(response);
}
