import { CampaignActiveCreatorsTable } from 'client';

function avatar(bg: string, initials: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='${bg}'/><text x='50%' y='54%' font-family='Arial' font-size='30' fill='white' text-anchor='middle' dominant-baseline='middle'>${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const creators = [
  {
    id: 'c1',
    name: 'Hoà Minzy',
    avatarUrl: avatar('#e63946', 'HM'),
    reachLabel: '1,8 triệu',
    engagementLabel: '6,4%',
    status: 'live' as const,
  },
  {
    id: 'c2',
    name: 'Call Me Duy',
    avatarUrl: avatar('#457b9d', 'CD'),
    reachLabel: '920K',
    engagementLabel: '8,1%',
    status: 'live' as const,
  },
  {
    id: 'c3',
    name: 'Trinh Phạm',
    avatarUrl: avatar('#f4a261', 'TP'),
    reachLabel: '1,2 triệu',
    engagementLabel: '5,7%',
    status: 'pending_post' as const,
  },
  {
    id: 'c4',
    name: 'Chan La Cà',
    avatarUrl: avatar('#2a9d8f', 'CL'),
    reachLabel: '640K',
    engagementLabel: '9,3%',
    status: 'pending_post' as const,
  },
];

export function Populated() {
  return (
    <div style={{ width: 720 }}>
      <CampaignActiveCreatorsTable creators={creators} />
    </div>
  );
}
