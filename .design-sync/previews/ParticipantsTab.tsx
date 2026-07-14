import { ParticipantsTab } from 'client';

const campaign: any = {
  id: 'ontop-fashion-windbreaker',
  name: 'ON TOP Jacket Drop',
  invite: { defaultCode: 'ONTOP10' },
};

const participants: any[] = [
  {
    id: 'p-owner',
    campaignId: 'ontop-fashion-windbreaker',
    name: 'Anh Thư',
    role: 'owner',
    status: 'joined',
    contactChannel: 'email',
    contactValue: 'anhthu@hivek.vn',
    inviteCode: 'OWNER',
    inviteLink: '/campaigns/ontop/invite?code=OWNER',
    permissions: ['view_brief', 'manage_posts', 'manage_participants'],
  },
  {
    id: 'p-mina',
    campaignId: 'ontop-fashion-windbreaker',
    name: 'Mina Outfit',
    role: 'koc',
    status: 'discussing',
    contactChannel: 'instagram',
    contactValue: '@mina.outfit',
    inviteCode: 'MINA10',
    inviteLink: '/campaigns/ontop/invite?code=MINA10',
    permissions: ['view_brief', 'upload_media', 'submit_draft'],
  },
  {
    id: 'p-tu',
    campaignId: 'ontop-fashion-windbreaker',
    name: 'Tú Mix Đồ',
    role: 'creator',
    status: 'invited',
    contactChannel: 'facebook',
    contactValue: 'tumixdo',
    inviteCode: 'TUMIX',
    inviteLink: '/campaigns/ontop/invite?code=TUMIX',
    permissions: ['view_brief', 'submit_draft'],
  },
  {
    id: 'p-review',
    campaignId: 'ontop-fashion-windbreaker',
    name: 'Hoàng Nam',
    role: 'reviewer',
    status: 'joined',
    contactChannel: 'email',
    contactValue: 'nam.review@hivek.vn',
    inviteCode: 'REVIEW',
    inviteLink: '/campaigns/ontop/invite?code=REVIEW',
    permissions: ['view_brief', 'manage_posts'],
  },
];

export function Default() {
  return (
    <div style={{ width: 860 }}>
      <ParticipantsTab
        campaign={campaign}
        participants={participants}
        onAddParticipant={() => {}}
        onCopyInviteLink={() => {}}
        onRemoveParticipant={() => {}}
      />
    </div>
  );
}
