import { NextResponse, type NextRequest } from "next/server";
import { matchKolKocRequestSchema } from "@/server/ai/schemas/agent.schemas";
import { matchKolKocWorkflow } from "@/server/ai/workflows/match-kol-koc.workflow";

export async function POST(request: NextRequest) {
  const body = matchKolKocRequestSchema.parse(await request.json());
  const response = await matchKolKocWorkflow(body);

  return NextResponse.json(response);
}
