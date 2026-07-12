import { CampaignPlanningHeader } from 'client';

const campaigns: any[] = [
  { id: 'ontop', name: 'ON TOP Jacket Drop', status: 'scheduled', description: '' },
  { id: 'lala', name: 'LALA Serum B5', status: 'ready', description: '' },
  { id: 'coffee', name: 'Nâu Coffee Ra Mắt Cold Brew', status: 'draft', description: '' },
];

export function Default() {
  return (
    <div style={{ width: 1080 }}>
      <CampaignPlanningHeader
        campaigns={campaigns}
        selectedCampaignId="ontop"
        onCampaignChange={() => {}}
        onAddCampaign={() => {}}
        onGeneratePlan={() => {}}
      />
    </div>
  );
}
