"use client";

import { useState } from "react";
import { Copy, Eye, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PARTICIPANT_ROLE_LABELS,
  PERMISSION_LABELS,
} from "@/features/campaign-management/data/campaign-management-options";
import type {
  CampaignBrief,
  CampaignParticipant,
  CampaignParticipantRole,
  CampaignPermission,
} from "@/features/campaign-management/types";

type ParticipantsTabProps = {
  campaign: CampaignBrief;
  participants: CampaignParticipant[];
  onAddParticipant: (input: Partial<CampaignParticipant>) => void;
  onCopyInviteLink: (link: string) => void;
  onRemoveParticipant: (participantId: string) => void;
};

const ROLE_OPTIONS: CampaignParticipantRole[] = [
  "editor",
  "reviewer",
  "kol",
  "koc",
  "creator",
  "affiliate",
  "guest",
];

const DEFAULT_INVITE_PERMISSIONS: CampaignPermission[] = [
  "view_brief",
  "upload_media",
  "submit_draft",
];

function statusLabel(status: CampaignParticipant["status"]) {
  const labels: Record<CampaignParticipant["status"], string> = {
    invited: "Đã mời",
    joined: "Đã tham gia",
    discussing: "Đang trao đổi",
    pending_review: "Chờ duyệt",
    rejected: "Từ chối",
    removed: "Đã xoá",
  };

  return labels[status];
}

function ParticipantInviteModal({
  campaign,
  onClose,
  onSubmit,
}: {
  campaign: CampaignBrief;
  onClose: () => void;
  onSubmit: (input: Partial<CampaignParticipant>) => void;
}) {
  const [name, setName] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [role, setRole] = useState<CampaignParticipantRole>("guest");
  const [inviteCode, setInviteCode] = useState(campaign.invite.defaultCode);
  const [notes, setNotes] = useState("");

  const submit = () => {
    onSubmit({
      name,
      role,
      contactChannel: "email",
      contactValue,
      inviteCode,
      inviteLink: `/campaigns/${campaign.id}/invite?code=${inviteCode}`,
      permissions: DEFAULT_INVITE_PERMISSIONS,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border border-primary-soft bg-card shadow-2xl">
        <header className="flex items-start justify-between border-b border-primary-soft p-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">
              Mời người tham gia chiến dịch
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">{campaign.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="grid gap-4 p-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Tên</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Email / SĐT / Social link</Label>
            <Input
              value={contactValue}
              onChange={(event) => setContactValue(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vai trò</Label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as CampaignParticipantRole)}
              className="h-11 w-full rounded-xl border border-primary-soft bg-muted/60 px-3 text-sm"
            >
              {ROLE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {PARTICIPANT_ROLE_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Mã mời riêng</Label>
            <Input
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Ghi chú</Label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="min-h-24 w-full resize-none rounded-xl border border-primary-soft bg-muted/60 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-primary-soft p-4 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>Huỷ</Button>
          <Button variant="outline" onClick={submit}>Tạo link mời</Button>
          <Button onClick={submit}>Lưu & Copy lời mời</Button>
        </footer>
      </div>
    </div>
  );
}

function ParticipantDetailDrawer({
  participant,
  onClose,
  onCopyInviteLink,
}: {
  participant: CampaignParticipant;
  onClose: () => void;
  onCopyInviteLink: (link: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-card shadow-2xl">
        <header className="flex items-start justify-between border-b border-primary-soft p-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">
              Thông tin người tham gia
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">
              {PARTICIPANT_ROLE_LABELS[participant.role]} · {statusLabel(participant.status)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary">
              {participant.name.slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-extrabold text-foreground">{participant.name}</p>
              <p className="text-xs text-foreground-muted">{participant.contactValue}</p>
            </div>
          </div>

          <div className="rounded-lg border border-primary-soft bg-background-light p-3">
            <p className="text-xs font-bold text-foreground">Invite code</p>
            <p className="mt-1 text-sm font-bold text-primary">{participant.inviteCode}</p>
            <p className="mt-2 break-all text-xs text-foreground-muted">
              {participant.inviteLink}
            </p>
            <Button className="mt-3" size="sm" onClick={() => onCopyInviteLink(participant.inviteLink)}>
              <Copy className="size-3.5" aria-hidden />
              Copy link
            </Button>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground">Quyền truy cập</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {participant.permissions.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {PERMISSION_LABELS[permission]}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-primary-soft bg-background-light p-3">
            <p className="text-xs font-bold text-foreground">Contact history</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Đã tạo link mời và chờ phản hồi từ người tham gia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ParticipantsTab({
  campaign,
  participants,
  onAddParticipant,
  onCopyInviteLink,
  onRemoveParticipant,
}: ParticipantsTabProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<CampaignParticipant | null>(null);
  const visibleParticipants = participants.filter(
    (participant) => participant.status !== "removed"
  );

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-primary-soft bg-background-light p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-foreground">Người tham gia</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Quản lý team member, KOL/KOC, reviewer và cộng tác viên.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsInviteOpen(true)}>
          <Plus className="size-3.5" aria-hidden />
          Mời người tham gia
        </Button>
      </div>

      {visibleParticipants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-primary-soft p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            Chưa có người tham gia chiến dịch.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-foreground-muted">
            Bạn có thể mời team member, KOL/KOC hoặc cộng tác viên bằng link mời.
          </p>
          <Button className="mt-4" size="sm" onClick={() => setIsInviteOpen(true)}>
            Mời người tham gia
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-primary-soft bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-primary-soft bg-background-light text-xs text-foreground-muted">
                <tr>
                  <th className="px-4 py-3 font-bold">Tên</th>
                  <th className="px-4 py-3 font-bold">Vai trò</th>
                  <th className="px-4 py-3 font-bold">Kênh</th>
                  <th className="px-4 py-3 font-bold">Mã mời / Code</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold">Quyền</th>
                  <th className="px-4 py-3 font-bold">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-soft">
                {visibleParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-background-light">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {participant.name}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {PARTICIPANT_ROLE_LABELS[participant.role]}
                    </td>
                    <td className="px-4 py-3 text-foreground-muted">
                      {participant.contactChannel ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary">
                      {participant.inviteCode}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={participant.status === "joined" ? "success" : "secondary"}>
                        {statusLabel(participant.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground-muted">
                      {participant.permissions.length} quyền
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedParticipant(participant)}
                          className="rounded-md p-2 text-foreground-muted hover:bg-muted hover:text-foreground"
                          aria-label="Xem"
                        >
                          <Eye className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => onCopyInviteLink(participant.inviteLink)}
                          className="rounded-md p-2 text-primary hover:bg-primary-soft"
                          aria-label="Copy link"
                        >
                          <Copy className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveParticipant(participant.id)}
                          className="rounded-md p-2 text-red-500 hover:bg-red-50"
                          aria-label="Xoá khỏi chiến dịch"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isInviteOpen ? (
        <ParticipantInviteModal
          campaign={campaign}
          onClose={() => setIsInviteOpen(false)}
          onSubmit={onAddParticipant}
        />
      ) : null}

      {selectedParticipant ? (
        <ParticipantDetailDrawer
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
          onCopyInviteLink={onCopyInviteLink}
        />
      ) : null}
    </div>
  );
}
