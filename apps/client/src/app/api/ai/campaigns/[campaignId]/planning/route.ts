import { NextResponse, type NextRequest } from "next/server";
import { getCampaignPlanningSnapshotWorkflow } from "@/server/ai/workflows/get-campaign-planning-snapshot.workflow";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params;
  const snapshot = await getCampaignPlanningSnapshotWorkflow(campaignId);

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
