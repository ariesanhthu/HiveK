import { STARTER_PROMPTS } from "@/features/ai-chat/data/ai-chat-data";
import type {
  AiChatIntent,
  AiChatMessageDraft,
  AiChatSetup,
  AiChatSetupProgress,
  SetupStepId,
  StarterPrompt,
} from "@/features/ai-chat/types";

const SETUP_STEPS: readonly SetupStepId[] = ["social", "brand", "drive"];

const INTENT_ACTIONS = {
  quickSetup: {
    id: "start-quick-setup",
    label: "Thiết lập ngữ cảnh trước",
    kind: "intent",
    intent: "quick-start",
    variant: "secondary",
  },
  planPosts: {
    id: "open-campaign-planning",
    label: "Mở trình lập kế hoạch",
    kind: "href",
    href: "/campaign-planning",
    variant: "primary",
  },
  campaignIdeas: {
    id: "open-campaign-management",
    label: "Tạo chiến dịch",
    kind: "href",
    href: "/campaign-management",
    variant: "primary",
  },
  findCreators: {
    id: "open-kol-matching",
    label: "Tìm KOL/KOC",
    kind: "href",
    href: "/kol-matching",
    variant: "primary",
  },
  analyzeContent: {
    id: "open-kol-analysis",
    label: "Mở phân tích",
    kind: "href",
    href: "/kol-analysis",
    variant: "primary",
  },
} as const;

const READY_ACTIONS = [
  {
    id: "complete-plan-posts",
    label: "Lên kế hoạch đăng bài",
    kind: "intent",
    intent: "plan-posts",
    variant: "primary",
  },
  {
    id: "complete-campaign-ideas",
    label: "Khám phá ý tưởng",
    kind: "intent",
    intent: "campaign-ideas",
    variant: "secondary",
  },
] as const;

function isSocialComplete(setup: AiChatSetup): boolean {
  return setup.socialPlatforms.length > 0;
}

function isBrandComplete(setup: AiChatSetup): boolean {
  return setup.branding.name.trim().length > 0 && setup.branding.tone !== null;
}

function isDriveComplete(setup: AiChatSetup): boolean {
  return setup.driveUrl.trim().length > 0;
}

function isStepComplete(step: SetupStepId, setup: AiChatSetup): boolean {
  if (step === "social") return isSocialComplete(setup);
  if (step === "brand") return isBrandComplete(setup);
  return isDriveComplete(setup);
}

function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function includesAny(input: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => input.includes(keyword));
}

function getPrompt(intent: AiChatIntent): StarterPrompt {
  const prompt = STARTER_PROMPTS.find((item) => item.id === intent);

  if (!prompt) {
    throw new Error(`Unknown AI chat intent: ${intent}`);
  }

  return prompt;
}

export function getNextIncompleteSetupStep(setup: AiChatSetup): SetupStepId | null {
  return SETUP_STEPS.find((step) => !isStepComplete(step, setup)) ?? null;
}

export function getSetupProgress(setup: AiChatSetup): AiChatSetupProgress {
  const completedSteps = SETUP_STEPS.filter((step) => isStepComplete(step, setup));
  const completed = completedSteps.length;
  const total = SETUP_STEPS.length;
  const nextStep = getNextIncompleteSetupStep(setup);

  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
    completedSteps,
    nextStep,
    isComplete: nextStep === null,
  };
}

export function resolveIntent(input: string): AiChatIntent | null {
  const normalizedInput = normalizeInput(input);

  if (
    includesAny(normalizedInput, [
      "bat dau nhanh",
      "quick start",
      "thiet lap",
      "setup",
      "ket noi tai khoan",
    ])
  ) {
    return "quick-start";
  }

  if (
    includesAny(normalizedInput, [
      "len ke hoach",
      "ke hoach dang bai",
      "lich dang",
      "lich noi dung",
      "content plan",
    ])
  ) {
    return "plan-posts";
  }

  if (
    includesAny(normalizedInput, [
      "y tuong",
      "chien dich",
      "campaign",
      "concept",
      "thong diep",
    ])
  ) {
    return "campaign-ideas";
  }

  if (
    includesAny(normalizedInput, [
      "kol",
      "koc",
      "creator",
      "influencer",
      "nguoi sang tao",
    ])
  ) {
    return "find-creators";
  }

  if (
    includesAny(normalizedInput, [
      "phan tich",
      "danh gia noi dung",
      "hieu qua noi dung",
      "content audit",
      "performance",
    ])
  ) {
    return "analyze-content";
  }

  return null;
}

export function createInitialAgentTurns(): AiChatMessageDraft[] {
  // The welcome screen owns the initial greeting and starter cards. Keeping the
  // transcript empty makes the first selected prompt the start of the chat.
  return [];
}

export function createUserTurn(content: string): AiChatMessageDraft {
  return {
    role: "user",
    content: content.trim(),
  };
}

function createNextSetupTurn(setup: AiChatSetup): AiChatMessageDraft | null {
  const nextStep = getNextIncompleteSetupStep(setup);

  if (nextStep === "social") {
    return {
      role: "assistant",
      content:
        "Bước 1/3 · Chọn các kênh mạng xã hội thương hiệu đang sử dụng. Đây chỉ là bước ghi nhận thủ công, HiveK chưa kết nối hay đăng nội dung thay bạn.",
      widget: { type: "social-connect" },
    };
  }

  if (nextStep === "brand") {
    return {
      role: "assistant",
      content:
        "Bước 2/3 · Cho mình biết tên thương hiệu và giọng điệu bạn muốn giữ nhất quán trong nội dung.",
      widget: { type: "brand-form" },
    };
  }

  if (nextStep === "drive") {
    return {
      role: "assistant",
      content:
        "Bước 3/3 · Thêm đường dẫn thư mục Drive chứa guideline, logo hoặc hình ảnh sản phẩm. HiveK chỉ lưu đường dẫn bạn nhập ở bản demo này.",
      widget: { type: "drive-form" },
    };
  }

  return null;
}

function appendNextIncompleteSetupTurn(
  turns: AiChatMessageDraft[],
  setup: AiChatSetup
): AiChatMessageDraft[] {
  const nextTurn = createNextSetupTurn(setup);
  return nextTurn ? [...turns, nextTurn] : turns;
}

export function createIntentAgentTurns(
  intent: AiChatIntent,
  setup: AiChatSetup
): AiChatMessageDraft[] {
  if (intent === "quick-start") {
    if (!getNextIncompleteSetupStep(setup)) {
      return [
        {
          role: "assistant",
          content:
            "Workspace của bạn đã có đủ thông tin nền tảng. Mình sẵn sàng tiếp tục với kế hoạch nội dung hoặc ý tưởng chiến dịch mới.",
          widget: { type: "setup-complete" },
          actions: [...READY_ACTIONS],
        },
      ];
    }

    return appendNextIncompleteSetupTurn(
      [
        {
          role: "assistant",
          content:
            "Tuyệt, mình sẽ hướng dẫn bạn hoàn thiện 3 phần: kênh xã hội, nhận diện thương hiệu và kho tài nguyên. Bạn có thể cập nhật từng phần ngay trong cuộc trò chuyện này.",
          widget: { type: "setup-overview" },
        },
      ],
      setup
    );
  }

  if (intent === "plan-posts") {
    return [
      {
        role: "assistant",
        content:
          "Mình có thể giúp bạn chuyển mục tiêu chiến dịch thành lịch đăng theo kênh, chủ đề và nhịp nội dung. Bạn có thể mở trình lập kế hoạch ngay, hoặc thiết lập ngữ cảnh thương hiệu trước để nhận gợi ý sát hơn.",
        actions: getNextIncompleteSetupStep(setup)
          ? [INTENT_ACTIONS.planPosts, INTENT_ACTIONS.quickSetup]
          : [INTENT_ACTIONS.planPosts],
      },
    ];
  }

  if (intent === "campaign-ideas") {
    return [
      {
        role: "assistant",
        content:
          "Mình có thể gợi ý concept, thông điệp chủ đạo và chuỗi nội dung cho chiến dịch. Bắt đầu từ campaign workspace hoặc thêm ngữ cảnh thương hiệu để các đề xuất bám sát giọng điệu hơn.",
        actions: getNextIncompleteSetupStep(setup)
          ? [INTENT_ACTIONS.campaignIdeas, INTENT_ACTIONS.quickSetup]
          : [INTENT_ACTIONS.campaignIdeas],
      },
    ];
  }

  if (intent === "find-creators") {
    return [
      {
        role: "assistant",
        content:
          "Mình sẽ giúp bạn thu hẹp danh sách KOL/KOC theo nền tảng, lĩnh vực, mục tiêu và ngân sách chiến dịch.",
        actions: [INTENT_ACTIONS.findCreators],
      },
    ];
  }

  return [
    {
      role: "assistant",
      content:
        "Mình có thể hỗ trợ đọc các chỉ số chính, nhận diện điểm mạnh và đề xuất hướng cải thiện cho nội dung hiện tại.",
      actions: [INTENT_ACTIONS.analyzeContent],
    },
  ];
}

export function createInputAgentTurns(
  input: string,
  setup: AiChatSetup
): AiChatMessageDraft[] {
  const intent = resolveIntent(input);

  if (intent) return createIntentAgentTurns(intent, setup);

  return [
    {
      role: "assistant",
      content:
        "Mình đã ghi nhận yêu cầu. Hiện tại trợ lý demo xử lý các luồng có sẵn; bạn có thể chọn một hướng bên dưới để tiếp tục.",
      actions: [
        {
          id: "suggest-plan-posts",
          label: "Lên kế hoạch đăng bài",
          kind: "intent",
          intent: "plan-posts",
          variant: "primary",
        },
        {
          id: "suggest-campaign-ideas",
          label: "Gợi ý chiến dịch",
          kind: "intent",
          intent: "campaign-ideas",
          variant: "secondary",
        },
      ],
    },
  ];
}

export function createSetupCompletionTurns(
  completedStep: SetupStepId,
  setup: AiChatSetup
): AiChatMessageDraft[] {
  const acknowledgement: Record<SetupStepId, string> = {
    social: `Đã ghi nhận ${setup.socialPlatforms.length} kênh xã hội cho workspace này.`,
    brand: `Đã lưu định hướng cho ${setup.branding.name}. Mình sẽ dùng giọng điệu này làm ngữ cảnh cho các gợi ý tiếp theo.`,
    drive:
      "Đã ghi nhận đường dẫn tài nguyên. Bản demo không truy cập hoặc đồng bộ dữ liệu từ Drive.",
  };

  const turns: AiChatMessageDraft[] = [
    {
      role: "assistant",
      content: acknowledgement[completedStep],
    },
  ];
  const nextTurn = createNextSetupTurn(setup);

  if (nextTurn) return [...turns, nextTurn];

  return [
    ...turns,
    {
      role: "assistant",
      content:
        "Thiết lập nhanh đã hoàn tất. HiveK đã có đủ ngữ cảnh cơ bản để đồng hành cùng kế hoạch nội dung của bạn.",
      widget: { type: "setup-complete" },
      actions: [...READY_ACTIONS],
    },
  ];
}

export const aiChatService = {
  getPrompt,
  getSetupProgress,
  createInitialAgentTurns,
  createUserTurn,
  createIntentAgentTurns,
  createInputAgentTurns,
  createSetupCompletionTurns,
};
