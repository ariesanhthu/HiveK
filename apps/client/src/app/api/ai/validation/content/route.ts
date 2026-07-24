import { validateContentRequestSchema } from '@/server/ai/schemas/agent.schemas';
import { validateContentWorkflow } from '@/server/ai/workflows/validate-content.workflow';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = validateContentRequestSchema.parse(await request.json());
  const response = await validateContentWorkflow(body);

  return NextResponse.json(response);
}
