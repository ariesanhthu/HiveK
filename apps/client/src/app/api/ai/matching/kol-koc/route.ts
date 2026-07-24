import { matchKolKocRequestSchema } from '@/server/ai/schemas/agent.schemas';
import { matchKolKocWorkflow } from '@/server/ai/workflows/match-kol-koc.workflow';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = matchKolKocRequestSchema.parse(await request.json());
  const response = await matchKolKocWorkflow(body);

  return NextResponse.json(response);
}
