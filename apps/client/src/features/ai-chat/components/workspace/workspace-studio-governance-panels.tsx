import {
  ArrowDown,
  ArrowUp,
  BellRing,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  History,
  ListTodo,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  AgentLearningConfig,
  AgentLearningRule,
  ApprovalWorkflow,
  NotificationRule,
  TeamMember,
  WorkspaceRole,
  WorkspaceStudioConfig,
  WorkspaceTask,
} from "@/features/ai-chat/types/workspace-types";
import {
  StudioDisclosure,
  StudioEmptyState,
  StudioListField,
  StudioNumberField,
  StudioPanelCard,
  StudioSelectField,
  StudioStatusPill,
  StudioTextAreaField,
  StudioTextField,
  StudioToggle,
  type StudioConfigChangeHandler,
  type StudioSelectOption,
} from "@/features/ai-chat/components/workspace/workspace-studio-controls";

type StudioPanelProps = {
  config: WorkspaceStudioConfig;
  onChange: StudioConfigChangeHandler;
  idPrefix: string;
};

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  content_manager: "Quản lý nội dung",
  creator: "Người sáng tạo",
  reviewer: "Người duyệt",
  analyst: "Phân tích",
  viewer: "Chỉ xem",
};

const ROLE_OPTIONS: StudioSelectOption[] = Object.entries(ROLE_LABELS).map(
  ([value, label]) => ({ value, label })
);

const ASSIGNABLE_ROLE_OPTIONS = ROLE_OPTIONS.filter(
  (option) => option.value !== "owner"
);

const MEMBER_STATUS_LABELS: Record<TeamMember["status"], string> = {
  active: "Đang hoạt động",
  invited: "Đã mời",
  suspended: "Tạm khóa",
};

const TASK_STATUS_LABELS: Record<WorkspaceTask["status"], string> = {
  todo: "Cần làm",
  in_progress: "Đang thực hiện",
  needs_approval: "Cần duyệt",
  done: "Hoàn tất",
};

const LEARNING_STATUS_LABELS: Record<AgentLearningRule["status"], string> = {
  candidate: "Đề xuất",
  stable: "Ổn định",
  rejected: "Đã loại",
};

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

function formatDateTime(value: string | null): string {
  if (!value) return "Chưa có hoạt động";
  return DATE_TIME_FORMATTER.format(new Date(value));
}

function createDraftId(prefix: string): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) return `${prefix}-${randomId}`;

  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizeWorkflowSteps(
  steps: ApprovalWorkflow["steps"]
): ApprovalWorkflow["steps"] {
  return steps.map((step, index) => ({ ...step, order: index + 1 }));
}

export function ApprovalPublishingPanel({
  config,
  onChange,
  idPrefix,
}: StudioPanelProps) {
  function updateWorkflow(
    workflowId: string,
    patch: Partial<ApprovalWorkflow>
  ): void {
    onChange(
      "approvalWorkflows",
      config.approvalWorkflows.map((workflow) =>
        workflow.id === workflowId ? { ...workflow, ...patch } : workflow
      )
    );
  }

  function addWorkflow(): void {
    const workflow: ApprovalWorkflow = {
      id: createDraftId("workflow"),
      name: "Quy trình mới",
      contentTypes: [],
      channelIds: [],
      steps: [{ order: 1, role: "reviewer", assigneeId: null }],
      slaHours: 24,
      fallbackMemberId: null,
      enabled: false,
    };

    onChange("approvalWorkflows", [...config.approvalWorkflows, workflow]);
  }

  function removeWorkflow(workflowId: string): void {
    onChange(
      "approvalWorkflows",
      config.approvalWorkflows.filter(
        (workflow) => workflow.id !== workflowId
      )
    );
  }

  function addWorkflowStep(workflow: ApprovalWorkflow): void {
    updateWorkflow(workflow.id, {
      steps: [
        ...workflow.steps,
        {
          order: workflow.steps.length + 1,
          role: "reviewer",
          assigneeId: null,
        },
      ],
    });
  }

  function removeWorkflowStep(
    workflow: ApprovalWorkflow,
    stepIndex: number
  ): void {
    if (workflow.steps.length <= 1) return;

    updateWorkflow(workflow.id, {
      steps: normalizeWorkflowSteps(
        workflow.steps.filter((_, index) => index !== stepIndex)
      ),
    });
  }

  function moveWorkflowStep(
    workflow: ApprovalWorkflow,
    stepIndex: number,
    direction: -1 | 1
  ): void {
    const targetIndex = stepIndex + direction;
    if (targetIndex < 0 || targetIndex >= workflow.steps.length) return;

    const nextSteps = [...workflow.steps];
    [nextSteps[stepIndex], nextSteps[targetIndex]] = [
      nextSteps[targetIndex],
      nextSteps[stepIndex],
    ];
    updateWorkflow(workflow.id, {
      steps: normalizeWorkflowSteps(nextSteps),
    });
  }

  return (
    <div className="space-y-4">
      <StudioPanelCard
        title="Chế độ xuất bản"
        description="Chọn cổng kiểm soát cuối cùng trước khi nội dung được đưa vào hàng đợi đăng."
        icon={<Send className="size-4" aria-hidden />}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <StudioSelectField
            id={`${idPrefix}-publishing-mode`}
            label="Quyền xuất bản"
            value={config.publishingMode}
            onChange={(value) =>
              onChange(
                "publishingMode",
                value as WorkspaceStudioConfig["publishingMode"]
              )
            }
            options={[
              {
                value: "approval_required",
                label: "Bắt buộc phê duyệt trước khi đăng",
              },
              {
                value: "manual_only",
                label: "Chỉ chuẩn bị nội dung, đăng thủ công",
              },
            ]}
          />
          <div className="rounded-xl border border-primary-soft bg-muted/45 px-4 py-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="text-sm font-bold text-foreground">
                  Không tự bỏ qua bước duyệt
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                  Thay đổi giá, ưu đãi, cam kết, lịch hoặc tài khoản đích sau khi duyệt sẽ đưa nội dung trở lại hàng chờ kiểm tra.
                </p>
              </div>
            </div>
          </div>
        </div>
      </StudioPanelCard>

      <StudioPanelCard
        title="Quy trình phê duyệt"
        description="Mỗi workflow xác định phạm vi, người duyệt, SLA và người thay thế; bước duyệt được áp dụng theo thứ tự."
        icon={<ClipboardCheck className="size-4" aria-hidden />}
        action={
          <Button variant="outline" size="sm" onClick={addWorkflow}>
            <Plus className="size-4" aria-hidden />
            Thêm workflow
          </Button>
        }
      >
        {config.approvalWorkflows.length ? (
          <div className="space-y-2">
            {config.approvalWorkflows.map((workflow, index) => (
              <StudioDisclosure
                key={workflow.id}
                title={workflow.name}
                description={`${workflow.steps.length} bước · SLA ${workflow.slaHours} giờ`}
                defaultOpen={index === 0}
                meta={
                  <StudioStatusPill
                    tone={workflow.enabled ? "success" : "neutral"}
                  >
                    {workflow.enabled ? "Đang áp dụng" : "Đang tắt"}
                  </StudioStatusPill>
                }
              >
                <div className="mb-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => removeWorkflow(workflow.id)}
                    aria-label={`Xóa workflow ${workflow.name}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Xóa workflow
                  </Button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <StudioToggle
                    id={`${idPrefix}-workflow-enabled-${workflow.id}`}
                    label="Kích hoạt workflow"
                    description="Workflow bị tắt vẫn được giữ nguyên cấu hình và lịch sử."
                    checked={workflow.enabled}
                    onChange={(checked) =>
                      updateWorkflow(workflow.id, { enabled: checked })
                    }
                  />
                  <StudioTextField
                    id={`${idPrefix}-workflow-name-${workflow.id}`}
                    label="Tên workflow"
                    value={workflow.name}
                    onChange={(value) =>
                      updateWorkflow(workflow.id, { name: value })
                    }
                    required
                  />
                  <StudioListField
                    id={`${idPrefix}-workflow-content-${workflow.id}`}
                    label="Loại nội dung"
                    values={workflow.contentTypes}
                    onChange={(values) =>
                      updateWorkflow(workflow.id, { contentTypes: values })
                    }
                    rows={3}
                  />
                  <StudioListField
                    id={`${idPrefix}-workflow-channels-${workflow.id}`}
                    label="ID kênh áp dụng"
                    values={workflow.channelIds}
                    onChange={(values) =>
                      updateWorkflow(workflow.id, { channelIds: values })
                    }
                    rows={3}
                  />
                  <StudioNumberField
                    id={`${idPrefix}-workflow-sla-${workflow.id}`}
                    label="SLA duyệt (giờ)"
                    value={workflow.slaHours}
                    onChange={(value) =>
                      updateWorkflow(workflow.id, { slaHours: value })
                    }
                    min={1}
                    max={720}
                  />
                  <StudioSelectField
                    id={`${idPrefix}-workflow-fallback-${workflow.id}`}
                    label="Người duyệt thay thế"
                    value={workflow.fallbackMemberId ?? ""}
                    onChange={(value) =>
                      updateWorkflow(workflow.id, {
                        fallbackMemberId: value || null,
                      })
                    }
                    options={[
                      { value: "", label: "Chưa chỉ định" },
                      ...config.team.map((member) => ({
                        value: member.id,
                        label: `${member.name} · ${ROLE_LABELS[member.role]}`,
                      })),
                    ]}
                  />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Clock3 className="size-4 text-foreground-muted" aria-hidden />
                    <h4 className="text-xs font-extrabold uppercase tracking-[0.1em] text-foreground-muted">
                      Các bước duyệt
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {workflow.steps.map((step, stepIndex) => (
                      <div
                        key={`${workflow.id}-${step.order}`}
                        className="grid gap-3 rounded-xl border border-primary-soft bg-muted/35 p-3 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.25fr)] sm:items-end lg:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.25fr)_auto]"
                      >
                        <div>
                          <p className="text-[11px] font-bold text-foreground-muted">
                            Bước
                          </p>
                          <span className="mt-2 flex size-9 items-center justify-center rounded-lg bg-card text-sm font-extrabold text-foreground">
                            {step.order}
                          </span>
                        </div>
                        <StudioSelectField
                          id={`${idPrefix}-workflow-role-${workflow.id}-${step.order}`}
                          label="Vai trò duyệt"
                          value={step.role}
                          onChange={(value) =>
                            updateWorkflow(workflow.id, {
                              steps: workflow.steps.map((item, itemIndex) =>
                                itemIndex === stepIndex
                                  ? {
                                      ...item,
                                      role: value as WorkspaceRole,
                                    }
                                  : item
                              ),
                            })
                          }
                          options={ROLE_OPTIONS}
                        />
                        <StudioSelectField
                          id={`${idPrefix}-workflow-assignee-${workflow.id}-${step.order}`}
                          label="Người phụ trách"
                          value={step.assigneeId ?? ""}
                          onChange={(value) =>
                            updateWorkflow(workflow.id, {
                              steps: workflow.steps.map((item, itemIndex) =>
                                itemIndex === stepIndex
                                  ? { ...item, assigneeId: value || null }
                                  : item
                              ),
                            })
                          }
                          options={[
                            { value: "", label: "Theo vai trò" },
                            ...config.team.map((member) => ({
                              value: member.id,
                              label: member.name,
                            })),
                          ]}
                        />
                        <div
                          className="flex items-center gap-1 sm:col-span-3 lg:col-span-1"
                          aria-label={`Sắp xếp bước ${step.order}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            onClick={() =>
                              moveWorkflowStep(workflow, stepIndex, -1)
                            }
                            disabled={stepIndex === 0}
                            aria-label={`Chuyển bước ${step.order} lên trên`}
                            title="Chuyển lên"
                          >
                            <ArrowUp className="size-4" aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            onClick={() =>
                              moveWorkflowStep(workflow, stepIndex, 1)
                            }
                            disabled={stepIndex === workflow.steps.length - 1}
                            aria-label={`Chuyển bước ${step.order} xuống dưới`}
                            title="Chuyển xuống"
                          >
                            <ArrowDown className="size-4" aria-hidden />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 text-red-700 hover:bg-red-50 hover:text-red-800"
                            onClick={() =>
                              removeWorkflowStep(workflow, stepIndex)
                            }
                            disabled={workflow.steps.length <= 1}
                            aria-label={`Xóa bước duyệt ${step.order}`}
                            title={
                              workflow.steps.length <= 1
                                ? "Workflow phải có ít nhất một bước"
                                : "Xóa bước"
                            }
                          >
                            <Trash2 className="size-4" aria-hidden />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => addWorkflowStep(workflow)}
                    aria-label={`Thêm bước duyệt cho ${workflow.name}`}
                  >
                    <Plus className="size-4" aria-hidden />
                    Thêm bước duyệt
                  </Button>
                </div>
              </StudioDisclosure>
            ))}
          </div>
        ) : (
          <StudioEmptyState>
            Chưa có workflow. Nội dung chỉ có thể được chuẩn bị và đăng thủ công cho đến khi quy trình duyệt được cấu hình.
          </StudioEmptyState>
        )}
      </StudioPanelCard>
    </div>
  );
}

export function AgentLearningPanel({
  config,
  onChange,
  idPrefix,
}: StudioPanelProps) {
  function updateLearning(patch: Partial<AgentLearningConfig>): void {
    onChange("agentLearning", { ...config.agentLearning, ...patch });
  }

  function updateLearningRule(
    ruleId: string,
    patch: Partial<AgentLearningRule>
  ): void {
    onChange(
      "learningRules",
      config.learningRules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule
      )
    );
  }

  return (
    <div className="space-y-4">
      <StudioPanelCard
        title="Cách Agent cộng tác"
        description="Xác định mức chủ động và các chỉ dẫn luôn phải được áp dụng khi Agent hỗ trợ công việc."
        icon={<Bot className="size-4" aria-hidden />}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <StudioSelectField
            id={`${idPrefix}-agent-mode`}
            label="Chế độ Agent"
            value={config.agentMode}
            onChange={(value) =>
              onChange("agentMode", value as WorkspaceStudioConfig["agentMode"])
            }
            options={[
              {
                value: "guided",
                label: "Hướng dẫn từng bước",
              },
              {
                value: "copilot",
                label: "Copilot chủ động đề xuất",
              },
            ]}
            hint="Agent có thể điều hướng tới màn hình phù hợp nhưng không tự xác nhận thay người dùng."
          />
          <div className="rounded-xl border border-primary-soft bg-muted/45 px-4 py-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              <div>
                <p className="text-sm font-bold text-foreground">
                  Người dùng giữ quyền quyết định
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                  Agent có thể chuẩn bị và đề xuất thao tác; duyệt, thay đổi quyền và xuất bản vẫn cần người có quyền xác nhận.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <StudioTextAreaField
              id={`${idPrefix}-agent-instructions`}
              label="Chỉ dẫn vận hành"
              value={config.agentInstructions}
              onChange={(value) => onChange("agentInstructions", value)}
              hint="Viết nguyên tắc và ưu tiên; không cần nhập prompt kỹ thuật."
              rows={7}
            />
          </div>
        </div>
      </StudioPanelCard>

      <StudioPanelCard
        title="Vòng học có kiểm soát"
        description="Phản hồi và hiệu quả chỉ tạo đề xuất học; rule ổn định phải đủ bằng chứng và theo policy xác nhận."
        icon={<BrainCircuit className="size-4" aria-hidden />}
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <StudioToggle
            id={`${idPrefix}-learning-enabled`}
            label="Bật vòng học"
            description="Tổng hợp tín hiệu từ chỉnh sửa, quyết định duyệt và hiệu quả nội dung."
            checked={config.learningEnabled && config.agentLearning.enabled}
            onChange={(checked) => {
              onChange("learningEnabled", checked);
              updateLearning({ enabled: checked });
            }}
          />
          <StudioToggle
            id={`${idPrefix}-learning-approved-edits`}
            label="Học từ chỉnh sửa đã duyệt"
            description="Chỉ dùng thay đổi nằm trong phiên bản nội dung được phê duyệt."
            checked={config.agentLearning.learnFromApprovedEdits}
            onChange={(checked) =>
              updateLearning({ learnFromApprovedEdits: checked })
            }
            disabled={!config.learningEnabled}
          />
          <StudioToggle
            id={`${idPrefix}-learning-performance`}
            label="Học từ hiệu quả nội dung"
            description="Đối chiếu tín hiệu với mục tiêu; không chỉ dựa vào lượt thích."
            checked={config.agentLearning.learnFromPerformance}
            onChange={(checked) =>
              updateLearning({ learnFromPerformance: checked })
            }
            disabled={!config.learningEnabled}
          />
          <StudioToggle
            id={`${idPrefix}-learning-approval`}
            label="Duyệt rule ổn định"
            description="Yêu cầu người dùng xác nhận trước khi đề xuất trở thành rule dùng lâu dài."
            checked={config.agentLearning.requireApprovalForStableRules}
            onChange={(checked) =>
              updateLearning({ requireApprovalForStableRules: checked })
            }
            disabled={!config.learningEnabled}
          />
          <StudioToggle
            id={`${idPrefix}-learning-preserve-rejected`}
            label="Giữ rule đã loại"
            description="Lưu lại để Agent không đề xuất lặp lại cùng một quy tắc."
            checked={config.agentLearning.preserveRejectedRules}
            onChange={(checked) =>
              updateLearning({ preserveRejectedRules: checked })
            }
            disabled={!config.learningEnabled}
          />
          <StudioNumberField
            id={`${idPrefix}-learning-samples`}
            label="Số mẫu tối thiểu"
            value={config.agentLearning.minimumSamples}
            onChange={(value) => updateLearning({ minimumSamples: value })}
            min={1}
            max={1000}
            hint="Dưới ngưỡng này, phát hiện chỉ được hiển thị là tín hiệu ban đầu."
          />
        </div>
      </StudioPanelCard>

      <StudioPanelCard
        title="Những điều Agent đã học"
        description="Kiểm tra bằng chứng, trạng thái và phạm vi trước khi cho phép dùng mỗi rule."
        icon={<UserRoundCog className="size-4" aria-hidden />}
      >
        {config.learningRules.length ? (
          <div className="space-y-2">
            {config.learningRules.map((rule, index) => (
              <StudioDisclosure
                key={rule.id}
                title={rule.label}
                description={rule.evidence}
                defaultOpen={index === 0}
                meta={
                  <StudioStatusPill
                    tone={
                      rule.status === "stable"
                        ? "success"
                        : rule.status === "candidate"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {LEARNING_STATUS_LABELS[rule.status]}
                  </StudioStatusPill>
                }
              >
                <div className="grid gap-4 lg:grid-cols-2">
                  <StudioToggle
                    id={`${idPrefix}-learning-rule-enabled-${rule.id}`}
                    label="Cho phép áp dụng"
                    description="Rule bị tắt vẫn hiển thị trong lịch sử học."
                    checked={rule.enabled}
                    onChange={(checked) =>
                      updateLearningRule(rule.id, { enabled: checked })
                    }
                    disabled={rule.status === "rejected"}
                  />
                  <StudioSelectField
                    id={`${idPrefix}-learning-rule-status-${rule.id}`}
                    label="Trạng thái"
                    value={rule.status}
                    onChange={(value) =>
                      updateLearningRule(rule.id, {
                        status: value as AgentLearningRule["status"],
                        enabled: value === "rejected" ? false : rule.enabled,
                      })
                    }
                    options={[
                      { value: "candidate", label: "Đề xuất cần theo dõi" },
                      { value: "stable", label: "Rule ổn định" },
                      { value: "rejected", label: "Loại bỏ" },
                    ]}
                  />
                  <StudioTextField
                    id={`${idPrefix}-learning-rule-label-${rule.id}`}
                    label="Nội dung rule"
                    value={rule.label}
                    onChange={(value) =>
                      updateLearningRule(rule.id, { label: value })
                    }
                  />
                  <StudioTextAreaField
                    id={`${idPrefix}-learning-rule-evidence-${rule.id}`}
                    label="Tóm tắt bằng chứng"
                    value={rule.evidence}
                    onChange={(value) =>
                      updateLearningRule(rule.id, { evidence: value })
                    }
                    rows={4}
                  />
                </div>
              </StudioDisclosure>
            ))}
          </div>
        ) : (
          <StudioEmptyState>
            Chưa có rule học. Agent sẽ chỉ tạo đề xuất sau khi có đủ mẫu và phản hồi đã duyệt.
          </StudioEmptyState>
        )}
      </StudioPanelCard>
    </div>
  );
}

export function TeamNotificationsAuditPanel({
  config,
  onChange,
  idPrefix,
}: StudioPanelProps) {
  function updateMember(memberId: string, patch: Partial<TeamMember>): void {
    onChange(
      "team",
      config.team.map((member) =>
        member.id === memberId ? { ...member, ...patch } : member
      )
    );
  }

  function addMember(): void {
    const member: TeamMember = {
      id: createDraftId("member"),
      name: "Thành viên mới",
      email: "",
      role: "viewer",
      channelIds: [],
      status: "invited",
      lastActiveAt: null,
    };

    onChange("team", [...config.team, member]);
  }

  function removeMember(member: TeamMember): void {
    if (member.role === "owner") return;

    onChange(
      "team",
      config.team.filter((item) => item.id !== member.id)
    );
    onChange(
      "approvalWorkflows",
      config.approvalWorkflows.map((workflow) => ({
        ...workflow,
        fallbackMemberId:
          workflow.fallbackMemberId === member.id
            ? null
            : workflow.fallbackMemberId,
        steps: workflow.steps.map((step) => ({
          ...step,
          assigneeId: step.assigneeId === member.id ? null : step.assigneeId,
        })),
      }))
    );
    onChange(
      "tasks",
      config.tasks.map((task) =>
        task.assigneeId === member.id ? { ...task, assigneeId: null } : task
      )
    );
  }

  function updateNotification(
    ruleId: string,
    patch: Partial<NotificationRule>
  ): void {
    onChange(
      "notifications",
      config.notifications.map((rule) =>
        rule.id === ruleId ? { ...rule, ...patch } : rule
      )
    );
  }

  function addNotification(): void {
    const notification: NotificationRule = {
      id: createDraftId("notification"),
      event: "Quy tắc mới",
      channels: ["in_app"],
      recipientRoles: ["reviewer"],
      digest: "instant",
      enabled: false,
    };

    onChange("notifications", [...config.notifications, notification]);
  }

  function removeNotification(ruleId: string): void {
    onChange(
      "notifications",
      config.notifications.filter((rule) => rule.id !== ruleId)
    );
  }

  function updateTask(taskId: string, patch: Partial<WorkspaceTask>): void {
    onChange(
      "tasks",
      config.tasks.map((task) =>
        task.id === taskId ? { ...task, ...patch } : task
      )
    );
  }

  const recentAudit = [...config.auditLog]
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime()
    )
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <StudioPanelCard
        title="Thành viên và phạm vi"
        description="Vai trò workspace và phạm vi kênh được quản lý riêng; thành viên chỉ thấy những kênh được cấp."
        icon={<UsersRound className="size-4" aria-hidden />}
        action={
          <Button variant="outline" size="sm" onClick={addMember}>
            <Plus className="size-4" aria-hidden />
            Thêm thành viên
          </Button>
        }
      >
        {config.team.length ? (
          <div className="space-y-2">
            {config.team.map((member, index) => (
              <StudioDisclosure
                key={member.id}
                title={member.name}
                description={`${member.email} · ${ROLE_LABELS[member.role]} · ${formatDateTime(member.lastActiveAt)}`}
                defaultOpen={index === 0}
                meta={
                  <StudioStatusPill
                    tone={
                      member.status === "active"
                        ? "success"
                        : member.status === "invited"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {MEMBER_STATUS_LABELS[member.status]}
                  </StudioStatusPill>
                }
              >
                <div className="mb-4 flex justify-end">
                  {member.role === "owner" ? (
                    <span className="text-xs font-semibold text-foreground-muted">
                      Owner không thể bị xóa
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => removeMember(member)}
                      aria-label={`Xóa thành viên ${member.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      Xóa thành viên
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <StudioTextField
                    id={`${idPrefix}-member-name-${member.id}`}
                    label="Họ và tên"
                    value={member.name}
                    onChange={(value) =>
                      updateMember(member.id, { name: value })
                    }
                    required
                    autoComplete="name"
                  />
                  <StudioTextField
                    id={`${idPrefix}-member-email-${member.id}`}
                    label="Email"
                    type="email"
                    value={member.email}
                    onChange={(value) =>
                      updateMember(member.id, { email: value })
                    }
                    required
                    autoComplete="email"
                  />
                  <StudioSelectField
                    id={`${idPrefix}-member-role-${member.id}`}
                    label="Vai trò workspace"
                    value={member.role}
                    onChange={(value) =>
                      updateMember(member.id, {
                        role: value as WorkspaceRole,
                      })
                    }
                    options={
                      member.role === "owner"
                        ? ROLE_OPTIONS
                        : ASSIGNABLE_ROLE_OPTIONS
                    }
                    hint={
                      member.role === "owner"
                        ? "Chuyển quyền sở hữu cần một quy trình xác nhận riêng."
                        : undefined
                    }
                    disabled={member.role === "owner"}
                  />
                  <StudioSelectField
                    id={`${idPrefix}-member-status-${member.id}`}
                    label="Trạng thái"
                    value={member.status}
                    onChange={(value) =>
                      updateMember(member.id, {
                        status: value as TeamMember["status"],
                      })
                    }
                    options={[
                      { value: "active", label: "Đang hoạt động" },
                      { value: "invited", label: "Đã mời" },
                      { value: "suspended", label: "Tạm khóa" },
                    ]}
                    disabled={member.role === "owner"}
                  />
                  <div className="lg:col-span-2">
                    <StudioListField
                      id={`${idPrefix}-member-channels-${member.id}`}
                      label="ID kênh được phép truy cập"
                      values={member.channelIds}
                      onChange={(values) =>
                        updateMember(member.id, { channelIds: values })
                      }
                      hint="Để trống nếu vai trò được phép truy cập mọi kênh trong workspace."
                      rows={3}
                      disabled={member.role === "owner"}
                    />
                  </div>
                </div>
              </StudioDisclosure>
            ))}
          </div>
        ) : (
          <StudioEmptyState>
            Chưa có thành viên. Owner có thể bổ sung thành viên từ khu vực quản lý workspace.
          </StudioEmptyState>
        )}
      </StudioPanelCard>

      <StudioPanelCard
        title="Quy tắc thông báo"
        description="Thông báo khẩn được gửi ngay; báo cáo và insight có thể gom theo ngày hoặc tuần để tránh làm phiền."
        icon={<BellRing className="size-4" aria-hidden />}
        action={
          <Button variant="outline" size="sm" onClick={addNotification}>
            <Plus className="size-4" aria-hidden />
            Thêm quy tắc
          </Button>
        }
      >
        {config.notifications.length ? (
          <div className="space-y-2">
            {config.notifications.map((rule, index) => (
              <StudioDisclosure
                key={rule.id}
                title={rule.event}
                description={`${rule.channels.length} kênh nhận · ${rule.recipientRoles.length} vai trò`}
                defaultOpen={index === 0}
                meta={
                  <StudioStatusPill tone={rule.enabled ? "success" : "neutral"}>
                    {rule.enabled ? "Đang gửi" : "Đang tắt"}
                  </StudioStatusPill>
                }
              >
                <div className="mb-4 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => removeNotification(rule.id)}
                    aria-label={`Xóa quy tắc thông báo ${rule.event}`}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    Xóa quy tắc
                  </Button>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <StudioToggle
                    id={`${idPrefix}-notification-enabled-${rule.id}`}
                    label="Bật thông báo"
                    description="Thông báo bị tắt vẫn giữ nguyên người nhận và nhịp gửi."
                    checked={rule.enabled}
                    onChange={(checked) =>
                      updateNotification(rule.id, { enabled: checked })
                    }
                  />
                  <StudioSelectField
                    id={`${idPrefix}-notification-digest-${rule.id}`}
                    label="Nhịp gửi"
                    value={rule.digest}
                    onChange={(value) =>
                      updateNotification(rule.id, {
                        digest: value as NotificationRule["digest"],
                      })
                    }
                    options={[
                      { value: "instant", label: "Gửi ngay" },
                      { value: "daily", label: "Tổng hợp hằng ngày" },
                      { value: "weekly", label: "Tổng hợp hằng tuần" },
                    ]}
                  />
                  <StudioTextField
                    id={`${idPrefix}-notification-event-${rule.id}`}
                    label="Sự kiện"
                    value={rule.event}
                    onChange={(value) =>
                      updateNotification(rule.id, { event: value })
                    }
                  />
                  <fieldset className="rounded-xl border border-primary-soft bg-muted/35 p-3">
                    <legend className="px-1 text-xs font-bold text-foreground">
                      Kênh nhận
                    </legend>
                    <div className="mt-1 flex flex-wrap gap-3">
                      {(
                        [
                          ["in_app", "Trong ứng dụng"],
                          ["email", "Email"],
                        ] as const
                      ).map(([channel, label]) => (
                        <label
                          key={channel}
                          className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs font-semibold text-foreground"
                        >
                          <input
                            type="checkbox"
                            checked={rule.channels.includes(channel)}
                            onChange={(event) =>
                              updateNotification(rule.id, {
                                channels: event.target.checked
                                  ? [...rule.channels, channel]
                                  : rule.channels.filter(
                                      (item) => item !== channel
                                    ),
                              })
                            }
                            className="size-4 rounded border-primary-soft accent-emerald-600 focus-visible:ring-2 focus-visible:ring-primary/40"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="rounded-xl border border-primary-soft bg-muted/35 p-3 lg:col-span-2">
                    <legend className="px-1 text-xs font-bold text-foreground">
                      Vai trò nhận thông báo
                    </legend>
                    <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                      {(Object.keys(ROLE_LABELS) as WorkspaceRole[]).map(
                        (role) => (
                          <label
                            key={role}
                            className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg px-2 text-xs font-semibold text-foreground"
                          >
                            <input
                              type="checkbox"
                              checked={rule.recipientRoles.includes(role)}
                              onChange={(event) =>
                                updateNotification(rule.id, {
                                  recipientRoles: event.target.checked
                                    ? [...rule.recipientRoles, role]
                                    : rule.recipientRoles.filter(
                                        (item) => item !== role
                                      ),
                                })
                              }
                              className="size-4 rounded border-primary-soft accent-emerald-600 focus-visible:ring-2 focus-visible:ring-primary/40"
                            />
                            {ROLE_LABELS[role]}
                          </label>
                        )
                      )}
                    </div>
                  </fieldset>
                </div>
              </StudioDisclosure>
            ))}
          </div>
        ) : (
          <StudioEmptyState>
            Chưa có quy tắc thông báo. Các trạng thái vẫn được hiển thị trong ứng dụng.
          </StudioEmptyState>
        )}
      </StudioPanelCard>

      <StudioPanelCard
        title="Công việc vận hành"
        description="Theo dõi những việc Agent, người dùng hoặc hệ thống đã đưa vào hàng chờ."
        icon={<ListTodo className="size-4" aria-hidden />}
      >
        {config.tasks.length ? (
          <div className="space-y-2">
            {config.tasks.map((task) => (
              <StudioDisclosure
                key={task.id}
                title={task.title}
                description={task.description}
                meta={
                  <StudioStatusPill
                    tone={
                      task.status === "done"
                        ? "success"
                        : task.status === "needs_approval"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </StudioStatusPill>
                }
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <StudioSelectField
                    id={`${idPrefix}-task-status-${task.id}`}
                    label="Trạng thái"
                    value={task.status}
                    onChange={(value) =>
                      updateTask(task.id, {
                        status: value as WorkspaceTask["status"],
                      })
                    }
                    options={[
                      { value: "todo", label: "Cần làm" },
                      { value: "in_progress", label: "Đang thực hiện" },
                      { value: "needs_approval", label: "Cần duyệt" },
                      { value: "done", label: "Hoàn tất" },
                    ]}
                  />
                  <StudioSelectField
                    id={`${idPrefix}-task-assignee-${task.id}`}
                    label="Người phụ trách"
                    value={task.assigneeId ?? ""}
                    onChange={(value) =>
                      updateTask(task.id, { assigneeId: value || null })
                    }
                    options={[
                      { value: "", label: "Chưa chỉ định" },
                      ...config.team.map((member) => ({
                        value: member.id,
                        label: member.name,
                      })),
                    ]}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-foreground-muted">
                  Ưu tiên: <strong className="text-foreground">{task.priority}</strong>
                  {task.dueAt ? ` · Hạn ${formatDateTime(task.dueAt)}` : ""}
                </p>
              </StudioDisclosure>
            ))}
          </div>
        ) : (
          <StudioEmptyState>Không có công việc đang theo dõi.</StudioEmptyState>
        )}
      </StudioPanelCard>

      <StudioPanelCard
        title="Nhật ký hoạt động"
        description="Lịch sử chỉ đọc giúp truy vết thay đổi dữ kiện, quyền, lịch đăng và quyết định phê duyệt."
        icon={<History className="size-4" aria-hidden />}
        action={<Badge variant="outline">{config.auditLog.length} sự kiện</Badge>}
      >
        {recentAudit.length ? (
          <ol className="space-y-2">
            {recentAudit.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-primary-soft bg-muted/35 px-3.5 py-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <p className="text-sm font-bold text-foreground">
                    {entry.actor} · {entry.action}
                  </p>
                  <time
                    dateTime={entry.occurredAt}
                    className="shrink-0 text-[11px] font-semibold text-foreground-muted"
                  >
                    {formatDateTime(entry.occurredAt)}
                  </time>
                </div>
                <p className="mt-1 text-xs leading-5 text-foreground-muted">
                  {entry.objectLabel} · {entry.detail}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <StudioEmptyState>Chưa có hoạt động được ghi nhận.</StudioEmptyState>
        )}
      </StudioPanelCard>
    </div>
  );
}
