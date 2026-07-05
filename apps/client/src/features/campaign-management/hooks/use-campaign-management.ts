"use client";

import { useCallback, useMemo, useState } from "react";
import {
  initialCampaigns,
  initialCreatorSuggestions,
  initialParticipants,
} from "@/features/campaign-management/data/mock-campaign-management";
import type {
  CampaignBrief,
  CampaignCreatorSuggestion,
  CampaignFormInput,
  CampaignPostingDay,
  CampaignPlatformContent,
  CampaignParticipant,
  CampaignParticipantRole,
  CampaignParticipantStatus,
  CampaignPermission,
  CreatorContactStatus,
} from "@/features/campaign-management/types";

const DEFAULT_PERMISSIONS: CampaignPermission[] = [
  "view_brief",
  "upload_media",
  "submit_draft",
  "view_schedule",
];

const DEFAULT_FORM: CampaignFormInput = {
  name: "",
  objective: "engagement",
  platforms: ["facebook"],
  productName: "",
  cta: "",
  landingUrl: "",
  description: "",
  keyMessage: "",
  targetAudience: "",
  customerInsight: "",
  usp: "",
  offer: "",
  tonePreset: "youthful",
  formality: 2,
  emojiLevel: "low",
  language: "vi",
  perspective: "brand",
  requiredKeywords: "",
  bannedKeywords: "",
  suggestedHashtags: "",
  numberOfPosts: 8,
  variantsPerPost: 2,
  creativity: 4,
  approvalMode: "per_post",
  inviteEnabled: true,
  inviteCode: "SUMMER2026",
};

function createPlatformContent(
  campaignName: string,
  productName: string,
  platforms: CampaignFormInput["platforms"],
  cta: string
): CampaignPlatformContent[] {
  const product = productName || "sản phẩm";

  return platforms.map((platform) => {
    if (platform === "instagram") {
      return {
        platform,
        postingStyle: "Visual-first, caption gọn, ưu tiên carousel/Reels.",
        primaryFormat: "Carousel 5 ảnh hoặc Reels 12 giây",
        contentAngle: `3 cách dùng ${product} trong outfit hằng ngày.`,
        mediaDirection:
          "Ảnh full outfit, ảnh detail chất liệu, ảnh phối đồ, ảnh lifestyle, ảnh CTA.",
        caption: `${campaignName}: lưu lại nếu bạn đang tìm một item dễ phối. DM để tụi mình tư vấn size và màu phù hợp.`,
        hashtags: ["#OOTD", "#StyleDaily", "#HiveK"],
      };
    }

    if (platform === "threads") {
      return {
        platform,
        postingStyle: "Conversation-first, ngắn, mở câu hỏi để kéo comment.",
        primaryFormat: "Text post + 1 ảnh",
        contentAngle: `Bạn thường chọn ${product} theo công năng hay theo outfit?`,
        mediaDirection: "Một ảnh lifestyle tự nhiên, ít chữ, sản phẩm rõ.",
        caption: `${product} có thể là item cứu những ngày không biết mặc gì. Bạn thích phối basic hay nổi bật hơn?`,
        hashtags: ["#Threads", "#OOTD"],
      };
    }

    return {
      platform,
      postingStyle: "Storytelling ngắn, rõ lợi ích, CTA comment/inbox.",
      primaryFormat: "Album 4 ảnh + caption bán hàng mềm",
      contentAngle: `${product} giải quyết một nhu cầu rất cụ thể trong ngày thường.`,
      mediaDirection:
        "Ảnh hero, ảnh chi tiết sản phẩm, ảnh before/after phối đồ, ảnh CTA ưu đãi.",
      caption: `${product} dành cho những ngày bạn cần outfit gọn nhưng vẫn chỉn chu. ${cta || "Comment để được tư vấn ngay."}`,
      hashtags: ["#Facebook", "#Campaign", "#HiveK"],
    };
  });
}

function createDefaultCommentReplies(productName: string) {
  const product = productName || "sản phẩm";

  return [
    {
      id: "qa-price",
      intent: "pricing" as const,
      question: "Giá bao nhiêu shop?",
      answer: `Bạn nhắn tin cho page hoặc comment mã ưu đãi, tụi mình gửi giá hiện tại của ${product} kèm voucher nếu còn hiệu lực nhé.`,
    },
    {
      id: "qa-size",
      intent: "size" as const,
      question: "Mình nên chọn size nào?",
      answer:
        "Bạn gửi chiều cao, cân nặng và form mặc mong muốn, agent sẽ gợi ý size vừa hoặc oversize nhẹ cho bạn.",
    },
    {
      id: "qa-shipping",
      intent: "shipping" as const,
      question: "Bao lâu nhận hàng?",
      answer:
        "Nội thành thường 1-2 ngày, tỉnh/thành khác khoảng 2-4 ngày tuỳ đơn vị vận chuyển. Tụi mình sẽ gửi mã tracking sau khi lên đơn.",
    },
  ];
}

function createPostingPlan(
  campaignName: string,
  platforms: CampaignFormInput["platforms"]
): CampaignPostingDay[] {
  const firstPlatform = platforms[0] ?? "facebook";
  const secondPlatform = platforms[1] ?? firstPlatform;
  const thirdPlatform = platforms[2] ?? secondPlatform;

  return [
    {
      day: 1,
      dateLabel: "Ngày 1 · Khởi động",
      posts: [
        {
          id: `${slugify(campaignName)}-day-1-post-1`,
          title: "Teaser chiến dịch",
          platform: firstPlatform,
          contentType: firstPlatform === "instagram" ? "carousel" : "caption",
          status: "draft",
          time: "09:00",
          owner: "Agent AI",
          angle: "Mở vấn đề và giới thiệu lợi ích chính.",
        },
        {
          id: `${slugify(campaignName)}-day-1-post-2`,
          title: "Câu hỏi kéo comment",
          platform: secondPlatform,
          contentType: secondPlatform === "threads" ? "thread" : "caption",
          status: "draft",
          time: "12:30",
          owner: "Agent AI",
          angle: "Đặt câu hỏi để lấy insight khách hàng.",
        },
      ],
    },
    {
      day: 2,
      dateLabel: "Ngày 3 · Cân nhắc",
      posts: [
        {
          id: `${slugify(campaignName)}-day-2-post-1`,
          title: "Nội dung giải thích USP",
          platform: thirdPlatform,
          contentType: thirdPlatform === "instagram" ? "reels" : "album",
          status: "draft",
          time: "19:30",
          owner: "Content team",
          angle: "Giải thích điểm khác biệt bằng ví dụ cụ thể.",
        },
        {
          id: `${slugify(campaignName)}-day-2-post-2`,
          title: "Q&A comment seeding",
          platform: firstPlatform,
          contentType: "caption",
          status: "draft",
          time: "20:15",
          owner: "Agent AI",
          angle: "Dùng câu hỏi mẫu để agent rep comment.",
        },
      ],
    },
    {
      day: 3,
      dateLabel: "Ngày 5 · Chuyển đổi",
      posts: [
        {
          id: `${slugify(campaignName)}-day-3-post-1`,
          title: "CTA ưu đãi",
          platform: firstPlatform,
          contentType: "caption",
          status: "draft",
          time: "20:00",
          owner: "Sales team",
          angle: "Nhắc mã mời, link mua và inbox tư vấn.",
        },
      ],
    },
  ];
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createInviteCode(name: string) {
  const compact = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);

  return compact ? `${compact}26` : `CAMP${Date.now().toString().slice(-4)}`;
}

function createCampaignFromInput(input: CampaignFormInput): CampaignBrief {
  const id = slugify(input.name) || `campaign-${Date.now()}`;
  const inviteCode = input.inviteCode.trim() || createInviteCode(input.name);
  const timestamp = new Date().toISOString();

  return {
    id,
    name: input.name.trim(),
    status: "draft",
    objective: input.objective,
    platforms: input.platforms,
    accountIds: input.platforms.map((platform) => `${platform}-hivek`),
    productIds: input.productName ? [slugify(input.productName)] : [],
    productName: input.productName.trim(),
    description: input.description.trim(),
    keyMessage: input.keyMessage.trim(),
    targetAudience: input.targetAudience.trim(),
    customerInsight: input.customerInsight.trim(),
    usp: input.usp.trim(),
    offer: input.offer.trim(),
    cta: input.cta.trim(),
    landingUrl: input.landingUrl.trim(),
    tone: {
      preset: input.tonePreset,
      formality: input.formality,
      emojiLevel: input.emojiLevel,
      language: input.language,
      perspective: input.perspective,
      requiredKeywords: splitList(input.requiredKeywords),
      bannedKeywords: splitList(input.bannedKeywords),
      suggestedHashtags: splitList(input.suggestedHashtags),
    },
    media: [],
    platformContent: createPlatformContent(
      input.name.trim(),
      input.productName.trim(),
      input.platforms,
      input.cta.trim()
    ),
    commentReplyExamples: createDefaultCommentReplies(input.productName.trim()),
    postingPlan: createPostingPlan(input.name.trim(), input.platforms),
    tracking: {
      impressions: 0,
      reach: 0,
      engagementRate: 0,
      clicks: 0,
      comments: 0,
      leads: 0,
      conversionRate: 0,
      spend: 0,
      revenue: 0,
    },
    aiConfig: {
      numberOfPosts: input.numberOfPosts,
      variantsPerPost: input.variantsPerPost,
      creativity: input.creativity,
      contentStrategies: ["awareness", "storytelling", "ugc", "sales"],
      generateCaption: true,
      generateHashtags: true,
      generateCta: true,
      generateMediaPrompt: true,
      generateSchedule: true,
      suggestCreators: true,
      approvalMode: input.approvalMode,
    },
    invite: {
      enabled: input.inviteEnabled,
      defaultCode: inviteCode,
      inviteLink: `/campaigns/${id}/invite?code=${inviteCode}`,
      permissions: DEFAULT_PERMISSIONS,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createFormFromCampaign(campaign: CampaignBrief): CampaignFormInput {
  return {
    name: campaign.name,
    objective: campaign.objective,
    platforms: campaign.platforms,
    productName: campaign.productName ?? "",
    cta: campaign.cta,
    landingUrl: campaign.landingUrl ?? "",
    description: campaign.description,
    keyMessage: campaign.keyMessage,
    targetAudience: campaign.targetAudience,
    customerInsight: campaign.customerInsight ?? "",
    usp: campaign.usp ?? "",
    offer: campaign.offer ?? "",
    tonePreset: campaign.tone.preset,
    formality: campaign.tone.formality,
    emojiLevel: campaign.tone.emojiLevel,
    language: campaign.tone.language,
    perspective: campaign.tone.perspective,
    requiredKeywords: campaign.tone.requiredKeywords.join(", "),
    bannedKeywords: campaign.tone.bannedKeywords.join(", "),
    suggestedHashtags: campaign.tone.suggestedHashtags.join(", "),
    numberOfPosts: campaign.aiConfig.numberOfPosts,
    variantsPerPost: campaign.aiConfig.variantsPerPost,
    creativity: campaign.aiConfig.creativity,
    approvalMode: campaign.aiConfig.approvalMode,
    inviteEnabled: campaign.invite.enabled,
    inviteCode: campaign.invite.defaultCode,
  };
}

function updateCampaignWithInput(
  campaign: CampaignBrief,
  input: CampaignFormInput
): CampaignBrief {
  const inviteCode = input.inviteCode.trim() || campaign.invite.defaultCode;

  return {
    ...campaign,
    name: input.name.trim(),
    objective: input.objective,
    platforms: input.platforms,
    accountIds: input.platforms.map((platform) => `${platform}-hivek`),
    productIds: input.productName ? [slugify(input.productName)] : [],
    productName: input.productName.trim(),
    description: input.description.trim(),
    keyMessage: input.keyMessage.trim(),
    targetAudience: input.targetAudience.trim(),
    customerInsight: input.customerInsight.trim(),
    usp: input.usp.trim(),
    offer: input.offer.trim(),
    cta: input.cta.trim(),
    landingUrl: input.landingUrl.trim(),
    tone: {
      preset: input.tonePreset,
      formality: input.formality,
      emojiLevel: input.emojiLevel,
      language: input.language,
      perspective: input.perspective,
      requiredKeywords: splitList(input.requiredKeywords),
      bannedKeywords: splitList(input.bannedKeywords),
      suggestedHashtags: splitList(input.suggestedHashtags),
    },
    aiConfig: {
      ...campaign.aiConfig,
      numberOfPosts: input.numberOfPosts,
      variantsPerPost: input.variantsPerPost,
      creativity: input.creativity,
      approvalMode: input.approvalMode,
    },
    platformContent: createPlatformContent(
      input.name.trim(),
      input.productName.trim(),
      input.platforms,
      input.cta.trim()
    ),
    postingPlan: createPostingPlan(input.name.trim(), input.platforms),
    invite: {
      ...campaign.invite,
      enabled: input.inviteEnabled,
      defaultCode: inviteCode,
      inviteLink: `/campaigns/${campaign.id}/invite?code=${inviteCode}`,
    },
    updatedAt: new Date().toISOString(),
  };
}

function createMockSuggestions(campaign: CampaignBrief): CampaignCreatorSuggestion[] {
  const niche = campaign.productName ? [campaign.productName, "lifestyle"] : ["brand", "ugc"];

  return [
    {
      id: `${campaign.id}-creator-1`,
      name: "Linh Travel",
      type: "koc",
      platforms: campaign.platforms.includes("instagram")
        ? ["instagram", "facebook"]
        : [campaign.platforms[0] ?? "facebook"],
      niche,
      followerRange: "30K - 50K",
      engagementRate: 4.8,
      audienceMatchScore: 89,
      estimatedCost: "1.500.000đ - 2.500.000đ",
      reason: [
        "Tệp người xem gần với khách hàng mục tiêu.",
        "Nội dung tự nhiên, phù hợp để kể câu chuyện chiến dịch.",
        "Có kinh nghiệm review sản phẩm theo format UGC.",
      ],
      contactStatus: "not_contacted",
    },
    {
      id: `${campaign.id}-creator-2`,
      name: "Minh Check-in",
      type: "creator",
      platforms: campaign.platforms.includes("instagram") ? ["instagram"] : campaign.platforms,
      niche: ["short video", "review"],
      followerRange: "80K - 120K",
      engagementRate: 5.2,
      audienceMatchScore: 84,
      estimatedCost: "3.000.000đ - 5.000.000đ",
      reason: [
        "Có thế mạnh video ngắn.",
        "Phù hợp với nội dung cần Reels hoặc carousel dễ lưu.",
        "Cách kể chuyện rõ ràng, dễ gắn CTA.",
      ],
      contactStatus: "not_contacted",
    },
    {
      id: `${campaign.id}-creator-3`,
      name: "Mây Lifestyle",
      type: "kol",
      platforms: campaign.platforms.includes("threads")
        ? ["threads", "facebook"]
        : ["facebook"],
      niche: ["lifestyle", "young audience"],
      followerRange: "100K+",
      engagementRate: 3.9,
      audienceMatchScore: 78,
      estimatedCost: "5.000.000đ - 8.000.000đ",
      reason: [
        "Phù hợp với nhóm khách hàng trẻ.",
        "Có phong cách nội dung mềm, dễ lồng ghép thương hiệu.",
        "Hỗ trợ tốt cho mục tiêu nhận diện.",
      ],
      contactStatus: "not_contacted",
    },
  ];
}

function creatorRoleToParticipantRole(
  creator: CampaignCreatorSuggestion
): CampaignParticipantRole {
  return creator.type;
}

export function useCampaignManagement() {
  const [campaigns, setCampaigns] = useState<CampaignBrief[]>(initialCampaigns);
  const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaigns[0]?.id ?? "");
  const [creatorSuggestions, setCreatorSuggestions] =
    useState<Record<string, CampaignCreatorSuggestion[]>>(initialCreatorSuggestions);
  const [participants, setParticipants] =
    useState<Record<string, CampaignParticipant[]>>(initialParticipants);
  const [notice, setNotice] = useState("");

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? campaigns[0],
    [campaigns, selectedCampaignId]
  );

  const selectedSuggestions = selectedCampaign
    ? creatorSuggestions[selectedCampaign.id] ?? []
    : [];

  const selectedParticipants = selectedCampaign
    ? participants[selectedCampaign.id] ?? []
    : [];
  const participantCounts = useMemo(() => {
    return Object.fromEntries(
      campaigns.map((campaign) => [
        campaign.id,
        (participants[campaign.id] ?? []).filter(
          (participant) => participant.status !== "removed"
        ).length,
      ])
    );
  }, [campaigns, participants]);

  const createCampaign = useCallback((input: CampaignFormInput) => {
    const campaign = createCampaignFromInput(input);

    setCampaigns((current) => [campaign, ...current]);
    setCreatorSuggestions((current) => ({
      ...current,
      [campaign.id]: campaign.aiConfig.suggestCreators ? createMockSuggestions(campaign) : [],
    }));
    setParticipants((current) => ({
      ...current,
      [campaign.id]: [],
    }));
    setSelectedCampaignId(campaign.id);
    setNotice("Đã tạo chiến dịch.");

    return campaign;
  }, []);

  const updateCampaign = useCallback((campaignId: string, input: CampaignFormInput) => {
    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === campaignId ? updateCampaignWithInput(campaign, input) : campaign
      )
    );
    setNotice("Đã cập nhật brief chiến dịch.");
  }, []);

  const generatePlan = useCallback(() => {
    if (!selectedCampaign) return;

    setCampaigns((current) =>
      current.map((campaign) =>
        campaign.id === selectedCampaign.id
          ? { ...campaign, status: "reviewing", updatedAt: new Date().toISOString() }
          : campaign
      )
    );
    setNotice("AI đã tạo kế hoạch nháp từ brief chiến dịch.");
  }, [selectedCampaign]);

  const generateCreatorSuggestions = useCallback(() => {
    if (!selectedCampaign) return;

    setCreatorSuggestions((current) => ({
      ...current,
      [selectedCampaign.id]: createMockSuggestions(selectedCampaign),
    }));
    setNotice("Đã gợi ý KOL/KOC phù hợp với chiến dịch.");
  }, [selectedCampaign]);

  const updateCreatorContactStatus = useCallback(
    (
      campaignId: string,
      creatorId: string,
      status: CreatorContactStatus
    ) => {
      setCreatorSuggestions((current) => ({
        ...current,
        [campaignId]: (current[campaignId] ?? []).map((creator) =>
          creator.id === creatorId ? { ...creator, contactStatus: status } : creator
        ),
      }));
      setNotice("Đã cập nhật trạng thái liên hệ.");
    },
    []
  );

  const generateInviteCode = useCallback((campaignId: string) => {
    const campaign = campaigns.find((item) => item.id === campaignId);
    return createInviteCode(campaign?.name ?? "Campaign");
  }, [campaigns]);

  const generateInviteLink = useCallback((campaignId: string, code: string) => {
    return `/campaigns/${campaignId}/invite?code=${code}`;
  }, []);

  const addParticipant = useCallback(
    (
      campaignId: string,
      input: Partial<CampaignParticipant>
    ): CampaignParticipant => {
      const inviteCode = input.inviteCode ?? generateInviteCode(campaignId);
      const timestamp = new Date().toISOString();
      const participant: CampaignParticipant = {
        id: `participant-${Date.now()}`,
        campaignId,
        name: input.name?.trim() || "Người tham gia mới",
        role: input.role ?? "guest",
        status: input.status ?? "invited",
        contactChannel: input.contactChannel,
        contactValue: input.contactValue,
        inviteCode,
        inviteLink: input.inviteLink ?? generateInviteLink(campaignId, inviteCode),
        permissions: input.permissions ?? DEFAULT_PERMISSIONS,
        creatorSuggestionId: input.creatorSuggestionId,
        notes: input.notes,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      setParticipants((current) => ({
        ...current,
        [campaignId]: [participant, ...(current[campaignId] ?? [])],
      }));
      setNotice("Đã thêm người tham gia chiến dịch.");

      return participant;
    },
    [generateInviteCode, generateInviteLink]
  );

  const addCreatorAsParticipant = useCallback(
    (campaignId: string, creator: CampaignCreatorSuggestion) => {
      const inviteCode = `${creator.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8)}${Date.now().toString().slice(-3)}`;

      updateCreatorContactStatus(campaignId, creator.id, "invited");
      addParticipant(campaignId, {
        name: creator.name,
        role: creatorRoleToParticipantRole(creator),
        status: "invited",
        inviteCode,
        inviteLink: generateInviteLink(campaignId, inviteCode),
        permissions: ["view_brief", "submit_draft", "upload_media"],
        creatorSuggestionId: creator.id,
        contactChannel: creator.contactInfo?.email ? "email" : "instagram",
        contactValue: creator.contactInfo?.email ?? creator.contactInfo?.instagram,
        notes: `Match ${creator.audienceMatchScore}% - ${creator.niche.join(", ")}`,
      });
    },
    [addParticipant, generateInviteLink, updateCreatorContactStatus]
  );

  const updateParticipant = useCallback(
    (
      campaignId: string,
      participantId: string,
      patch: Partial<CampaignParticipant>
    ) => {
      setParticipants((current) => ({
        ...current,
        [campaignId]: (current[campaignId] ?? []).map((participant) =>
          participant.id === participantId
            ? { ...participant, ...patch, updatedAt: new Date().toISOString() }
            : participant
        ),
      }));
    },
    []
  );

  const removeParticipant = useCallback((campaignId: string, participantId: string) => {
    const patch: Partial<CampaignParticipant> = {
      status: "removed" satisfies CampaignParticipantStatus,
    };

    updateParticipant(campaignId, participantId, patch);
    setNotice("Đã xoá khỏi chiến dịch.");
  }, [updateParticipant]);

  const validationMessages = useMemo(() => {
    if (!selectedCampaign) return ["Chưa có chiến dịch nào."];

    const missing: string[] = [];
    if (!selectedCampaign.name) missing.push("Tên chiến dịch");
    if (!selectedCampaign.objective) missing.push("Mục tiêu");
    if (selectedCampaign.platforms.length === 0) missing.push("Ít nhất 1 nền tảng");
    if (!selectedCampaign.description) missing.push("Mô tả chiến dịch");
    if (!selectedCampaign.keyMessage) missing.push("Thông điệp chính");
    if (!selectedCampaign.targetAudience) missing.push("Khách hàng mục tiêu");
    if (!selectedCampaign.tone.preset) missing.push("Tone giọng");
    if (!selectedCampaign.cta) missing.push("CTA");
    if (!selectedCampaign.aiConfig.numberOfPosts) missing.push("Số bài muốn tạo");

    return missing;
  }, [selectedCampaign]);

  const clearNotice = useCallback(() => setNotice(""), []);

  return {
    defaultForm: DEFAULT_FORM,
    getCampaignForm: createFormFromCampaign,
    campaigns,
    selectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    creatorSuggestions: selectedSuggestions,
    participants: selectedParticipants,
    participantCounts,
    notice,
    clearNotice,
    validationMessages,
    createCampaign,
    updateCampaign,
    generatePlan,
    generateCreatorSuggestions,
    updateCreatorContactStatus,
    addCreatorAsParticipant,
    addParticipant,
    updateParticipant,
    removeParticipant,
    generateInviteCode,
    generateInviteLink,
  };
}
