import { saveFeedbackRequestSchema } from '@/server/ai/schemas/agent.schemas';
import { saveFeedbackWorkflow } from '@/server/ai/workflows/save-feedback.workflow';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = saveFeedbackRequestSchema.parse(await request.json());
  const response = await saveFeedbackWorkflow(body);

  return NextResponse.json(response);
}
