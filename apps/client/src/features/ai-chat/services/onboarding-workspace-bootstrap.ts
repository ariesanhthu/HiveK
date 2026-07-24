import type {
  AgentOnboardingState,
  DiscoverySource,
  OnboardingConnectionChoice,
} from '../types/onboarding-types';
import type {
  AgentWorkspaceData,
  BrandFact,
  BrandFactCategory,
  ChannelProfile,
  NinetyDayStrategy,
  Provenance,
  SatelliteRecommendation,
  SocialPlatform,
  StrategyChannelAllocation,
  StudioConfig,
  WorkspaceAnalytics,
  WorkspaceSource,
} from '../types/workspace-types';
import { isAgentWorkspaceData, saveAgentWorkspaceDemo } from './workspace-demo-service';

type SelectedWorkspaceResources = {
  sources: WorkspaceSource[];
  channels: ChannelProfile[];
  selectedSeedSourceIds: Set<string>;
};

const PLATFORM_COPY: Record<
  SocialPlatform,
  {
    label: string;
    role: string;
    formats: string[];
    cadence: string;
    primaryKpi: string;
  }
> = {
  website: {
    label: 'Website',
    role: 'Nguồn thông tin chính và điểm chuyển đổi',
    formats: ['Landing page', 'Bài chuyên sâu', 'FAQ'],
    cadence: '1–2 nội dung/tuần',
    primaryKpi: 'Lượt gửi biểu mẫu đủ điều kiện',
  },
  facebook: {
    label: 'Facebook',
    role: 'Đối thoại, xây cộng đồng và nuôi dưỡng nhu cầu',
    formats: ['Bài ngắn', 'Video', 'Q&A', 'Livestream'],
    cadence: '3–5 bài/tuần',
    primaryKpi: 'Hội thoại chất lượng',
  },
  tiktok: {
    label: 'TikTok',
    role: 'Mở rộng khám phá bằng nội dung ngắn',
    formats: ['Video ngắn', 'Series', 'Reply comment'],
    cadence: '3–5 video/tuần',
    primaryKpi: 'Tỷ lệ xem hoàn tất',
  },
  youtube: {
    label: 'YouTube',
    role: 'Xây thư viện nội dung chuyên sâu có tuổi thọ dài',
    formats: ['Video hướng dẫn', 'Shorts', 'Playlist'],
    cadence: '1 video dài + 2 Shorts/tuần',
    primaryKpi: 'Thời lượng xem',
  },
  linkedin: {
    label: 'LinkedIn',
    role: 'Xây uy tín chuyên môn và quan hệ đối tác',
    formats: ['Bài chuyên môn', 'Carousel', 'Case study'],
    cadence: '2–3 bài/tuần',
    primaryKpi: 'Tương tác chất lượng',
  },
  x: {
    label: 'X',
    role: 'Cập nhật nhanh và thử nghiệm thông điệp',
    formats: ['Post ngắn', 'Thread', 'Poll'],
    cadence: '4–7 post/tuần',
    primaryKpi: 'Tỷ lệ tương tác',
  },
};

function cloneWorkspace(data: AgentWorkspaceData): AgentWorkspaceData {
  const cloned: unknown = typeof structuredClone === 'function'
    ? structuredClone(data)
    : JSON.parse(JSON.stringify(data));

  if (!isAgentWorkspaceData(cloned)) {
    throw new Error('Không thể sao chép workspace seed hợp lệ.');
  }

  return cloned;
}

function toSlug(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'workspace-moi';
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function parseTraits(value: string): string[] {
  const traits = value
    .split(/[,;|\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);

  return traits.length > 0 ? traits : ['Rõ ràng', 'Nhất quán', 'Hữu ích'];
}

function urlHostname(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function handleFromUrl(value: string | null, fallback: string): string {
  if (!value) return fallback;
  try {
    const url = new URL(value);
    const lastSegment = url.pathname.split('/').filter(Boolean).at(-1);
    return lastSegment || url.hostname.replace(/^www\./, '');
  } catch {
    return fallback;
  }
}

function platformFromSource(
  source: DiscoverySource | undefined,
  choice: OnboardingConnectionChoice,
): SocialPlatform | null {
  if (source?.kind === 'website') return 'website';
  if (
    source?.kind === 'facebook'
    || source?.kind === 'tiktok'
    || source?.kind === 'youtube'
    || source?.kind === 'linkedin'
    || source?.kind === 'x'
  ) {
    return source.kind;
  }
  if (source?.kind === 'google_drive') return null;

  const marker = `${choice.sourceId} ${choice.accountUrl ?? ''}`.toLowerCase();
  if (marker.includes('facebook.com') || marker.includes('source-facebook')) {
    return 'facebook';
  }
  if (marker.includes('tiktok.com') || marker.includes('source-tiktok')) {
    return 'tiktok';
  }
  if (marker.includes('youtube.com') || marker.includes('youtu.be')) {
    return 'youtube';
  }
  if (marker.includes('linkedin.com') || marker.includes('source-linkedin')) {
    return 'linkedin';
  }
  if (
    marker.includes('x.com')
    || marker.includes('twitter.com')
    || marker.includes('source-x')
  ) {
    return 'x';
  }
  if (marker.includes('drive.google.com')) return null;
  return 'website';
}

function isDriveSource(
  source: DiscoverySource | undefined,
  choice: OnboardingConnectionChoice,
): boolean {
  return (
    source?.kind === 'google_drive'
    || (choice.accountUrl ?? '').toLowerCase().includes('drive.google.com')
  );
}

function sourceConnectionState(
  choice: OnboardingConnectionChoice,
  discoverySource: DiscoverySource | undefined,
): Pick<WorkspaceSource, 'status' | 'canRead' | 'canWrite'> {
  if (choice.status === 'connected') {
    return {
      status: 'connected',
      canRead: true,
      canWrite: choice.permission === 'read_publish',
    };
  }

  const canReadPublicly = choice.decision === 'public_read'
    || choice.decision === 'manual'
    || discoverySource?.status === 'found_public';

  if (choice.status === 'needs_input' || !canReadPublicly) {
    return { status: 'needs_reconnect', canRead: false, canWrite: false };
  }

  return { status: 'public_only', canRead: true, canWrite: false };
}

function channelConnectionStatus(
  source: WorkspaceSource,
): ChannelProfile['connectionStatus'] {
  if (source.status === 'connected') return 'connected';
  if (source.status === 'needs_reconnect') return 'needs_reconnect';
  return 'public_only';
}

function provenanceForSource(
  id: string,
  label: string,
  url: string | null,
  now: string,
): Provenance {
  return {
    id: `prov-onboarding-${toSlug(id)}`,
    sourceType: 'user',
    label,
    url,
    observedAt: now,
    note: 'Nguồn và phạm vi quyền được người dùng xác nhận trong onboarding.',
  };
}

function makeGenericChannel(
  platform: SocialPlatform,
  source: WorkspaceSource,
  choice: OnboardingConnectionChoice,
  businessName: string,
  industry: string,
  audiences: string[],
  services: string[],
  now: string,
): ChannelProfile {
  const copy = PLATFORM_COPY[platform];
  const displayName = choice.accountLabel.trim() || `${businessName} — ${copy.label}`;
  const contentPillars = services.length > 0
    ? services.slice(0, 4)
    : [`Kiến thức ${industry}`, 'Câu hỏi thường gặp', 'Câu chuyện khách hàng'];

  return {
    id: source.channelId ?? `channel-${toSlug(source.id)}`,
    platform,
    displayName,
    handle: handleFromUrl(source.url, toSlug(displayName)),
    url: source.url ?? '',
    role: copy.role,
    audience: audiences.length > 0 ? audiences : ['Khách hàng mục tiêu cần xác nhận'],
    contentPillars,
    formats: [...copy.formats],
    tone: 'Rõ ràng, hữu ích và nhất quán với thương hiệu',
    cadence: copy.cadence,
    connectionStatus: channelConnectionStatus(source),
    canRead: source.canRead,
    canPublish: source.canWrite,
    status: 'needs_review',
    dataQuality: 'user_provided',
    metrics: [],
    provenance: [
      provenanceForSource(source.id, choice.accountLabel, source.url, now),
    ],
    lastSyncedAt: source.lastSyncedAt,
    confirmedAt: null,
  };
}

function buildSelectedResources(
  state: AgentOnboardingState,
  seed: AgentWorkspaceData,
  preserveSeedChannels: boolean,
  now: string,
): SelectedWorkspaceResources {
  const activeChoices = state.connections.filter(
    (choice) => choice.decision !== 'skip' && choice.status !== 'skipped',
  );
  const discoveryById = new Map(
    state.discovery.sources.map((source) => [source.id, source]),
  );
  const seedSourceById = new Map(seed.sources.map((source) => [source.id, source]));
  const seedChannelById = new Map(
    seed.channels.map((channel) => [channel.id, channel]),
  );
  const selectedSeedSourceIds = new Set<string>();
  const sources: WorkspaceSource[] = [];
  const channels: ChannelProfile[] = [];
  const usedSourceIds = new Set<string>();
  const usedChannelIds = new Set<string>();

  for (const choice of activeChoices) {
    if (usedSourceIds.has(choice.sourceId)) continue;
    usedSourceIds.add(choice.sourceId);

    const discoverySource = discoveryById.get(choice.sourceId);
    const seedSource = seedSourceById.get(choice.sourceId);
    if (seedSource) selectedSeedSourceIds.add(seedSource.id);

    const platform = platformFromSource(discoverySource, choice);
    const drive = isDriveSource(discoverySource, choice);
    const sourceUrl = choice.accountUrl ?? discoverySource?.url ?? seedSource?.url ?? null;
    const candidateChannelId = platform === null
      ? null
      : seedSource?.channelId ?? `channel-${toSlug(choice.sourceId)}`;
    const connection = sourceConnectionState(choice, discoverySource);

    const workspaceSource: WorkspaceSource = {
      id: choice.sourceId,
      name: choice.accountLabel.trim()
        || discoverySource?.label
        || seedSource?.name
        || 'Nguồn đã chọn',
      type: drive ? 'drive' : platform === 'website' ? 'website' : 'social',
      url: sourceUrl,
      scope: connection.status === 'connected'
        ? 'Dữ liệu trong phạm vi quyền người dùng đã cấp'
        : 'Hồ sơ và nội dung công khai; không có insights riêng tư',
      ...connection,
      lastSyncedAt: connection.canRead ? now : null,
      channelId: candidateChannelId,
      permission: choice.permission,
      syncFrequency: connection.status === 'connected' ? 'daily' : 'manual',
      includeInAgentKnowledge: connection.canRead,
    };

    sources.push(workspaceSource);
    if (!platform || !candidateChannelId || usedChannelIds.has(candidateChannelId)) {
      continue;
    }
    usedChannelIds.add(candidateChannelId);

    const seedChannel = seedSource?.channelId
      ? seedChannelById.get(seedSource.channelId)
      : undefined;
    if (preserveSeedChannels && seedChannel) {
      channels.push({
        ...seedChannel,
        url: sourceUrl ?? seedChannel.url,
        connectionStatus: channelConnectionStatus(workspaceSource),
        canRead: workspaceSource.canRead,
        canPublish: workspaceSource.canWrite,
        metrics: seedChannel.metrics.map((metric) => ({ ...metric })),
        provenance: seedChannel.provenance.map((item) => ({ ...item })),
        lastSyncedAt: workspaceSource.lastSyncedAt,
      });
    } else {
      channels.push(
        makeGenericChannel(
          platform,
          workspaceSource,
          choice,
          state.details.businessName.trim() || 'Workspace mới',
          state.details.industry.trim() || 'lĩnh vực đang xác nhận',
          state.details.targetAudiences,
          state.details.services,
          now,
        ),
      );
    }
  }

  return { sources, channels, selectedSeedSourceIds };
}

function userFact(
  id: string,
  category: BrandFactCategory,
  label: string,
  value: string,
  isRequired: boolean,
  now: string,
  websiteUrl: string,
): BrandFact {
  return {
    id,
    category,
    label,
    value,
    dataQuality: 'user_provided',
    confidence: 1,
    status: 'confirmed',
    isRequired,
    provenance: [
      {
        id: `prov-${id}-onboarding`,
        sourceType: 'user',
        label: 'Thông tin người dùng xác nhận',
        url: websiteUrl || null,
        observedAt: now,
        note: 'Giá trị được người dùng kiểm tra và xác nhận trong onboarding.',
      },
    ],
    updatedAt: now,
    confirmedAt: now,
  };
}

function genericFacts(state: AgentOnboardingState, now: string): BrandFact[] {
  const details = state.details;
  const facts: BrandFact[] = [];
  const add = (
    id: string,
    category: BrandFactCategory,
    label: string,
    value: string,
    required = false,
  ) => {
    const normalized = value.trim();
    if (!normalized) return;
    facts.push(
      userFact(
        id,
        category,
        label,
        normalized,
        required,
        now,
        details.websiteUrl.trim(),
      ),
    );
  };

  add('fact-brand-name', 'identity', 'Tên thương hiệu', details.businessName, true);
  add('fact-industry', 'identity', 'Lĩnh vực', details.industry, true);
  add('fact-website', 'contact', 'Website', details.websiteUrl);
  add('fact-summary', 'positioning', 'Mô tả ngắn', details.summary, true);
  add('fact-market', 'positioning', 'Thị trường chính', details.primaryMarket, true);
  add('fact-address', 'contact', 'Địa chỉ', details.address);
  add('fact-phone', 'contact', 'Số điện thoại', details.phone);
  add('fact-email', 'contact', 'Email', details.email);
  add('fact-voice', 'voice', 'Ghi chú giọng thương hiệu', details.brandVoiceNotes);
  details.targetAudiences.forEach((audience, index) =>
    add(
      `fact-audience-${index + 1}`,
      'audience',
      index === 0 ? 'Khách hàng chính' : `Nhóm khách hàng ${index + 1}`,
      audience,
      index === 0,
    )
  );
  details.services.forEach((service, index) =>
    add(
      `fact-service-${index + 1}`,
      'service',
      index === 0 ? 'Dịch vụ chính' : `Dịch vụ ${index + 1}`,
      service,
      index === 0,
    )
  );

  return facts;
}

function replaceRichFact(
  facts: BrandFact[],
  id: string,
  category: BrandFactCategory,
  label: string,
  value: string,
  required: boolean,
  now: string,
  websiteUrl: string,
): void {
  if (!value.trim()) return;
  const replacement = userFact(
    id,
    category,
    label,
    value.trim(),
    required,
    now,
    websiteUrl,
  );
  const index = facts.findIndex((fact) => fact.id === id);
  if (index >= 0) facts[index] = replacement;
  else facts.push(replacement);
}

function applyRichDetails(
  workspace: AgentWorkspaceData,
  state: AgentOnboardingState,
  now: string,
): void {
  const details = state.details;
  const websiteUrl = details.websiteUrl.trim();
  const facts = workspace.brand.facts.map((fact) => ({ ...fact }));

  replaceRichFact(
    facts,
    'fact-brand-name',
    'identity',
    'Tên thương hiệu',
    details.businessName,
    true,
    now,
    websiteUrl,
  );
  replaceRichFact(
    facts,
    'fact-industry',
    'identity',
    'Lĩnh vực',
    details.industry,
    true,
    now,
    websiteUrl,
  );
  replaceRichFact(
    facts,
    'fact-website',
    'contact',
    'Website chính thức',
    details.websiteUrl,
    false,
    now,
    websiteUrl,
  );
  replaceRichFact(
    facts,
    'fact-mission',
    'positioning',
    'Mô tả và định hướng',
    details.summary,
    true,
    now,
    websiteUrl,
  );
  replaceRichFact(
    facts,
    'fact-market',
    'positioning',
    'Thị trường chính',
    details.primaryMarket,
    true,
    now,
    websiteUrl,
  );
  replaceRichFact(
    facts,
    'fact-address',
    'contact',
    'Địa chỉ',
    details.address,
    false,
    now,
    websiteUrl,
  );
  replaceRichFact(facts, 'fact-phone', 'contact', 'Hotline', details.phone, false, now, websiteUrl);
  replaceRichFact(
    facts,
    'fact-email',
    'contact',
    'Email liên hệ',
    details.email,
    false,
    now,
    websiteUrl,
  );
  replaceRichFact(
    facts,
    'fact-voice',
    'voice',
    'Giọng thương hiệu',
    details.brandVoiceNotes,
    true,
    now,
    websiteUrl,
  );

  if (details.targetAudiences.length > 0) {
    const retained = facts.filter((fact) => fact.category !== 'audience');
    details.targetAudiences.forEach((audience, index) => {
      retained.push(
        userFact(
          `fact-audience-${index + 1}`,
          'audience',
          index === 0 ? 'Khách hàng chính' : `Nhóm khách hàng ${index + 1}`,
          audience,
          index === 0,
          now,
          websiteUrl,
        ),
      );
    });
    facts.splice(0, facts.length, ...retained);
  }

  if (details.services.length > 0) {
    const retained = facts.filter((fact) => fact.category !== 'service');
    details.services.forEach((service, index) => {
      retained.push(
        userFact(
          `fact-service-${index + 1}`,
          'service',
          index === 0 ? 'Dịch vụ chính' : `Dịch vụ ${index + 1}`,
          service,
          index === 0,
          now,
          websiteUrl,
        ),
      );
    });
    facts.splice(0, facts.length, ...retained);
  }

  if (details.businessName.trim()) {
    workspace.workspace.name = details.businessName.trim();
    workspace.brand.name = details.businessName.trim();
  }
  if (details.websiteUrl.trim()) workspace.workspace.websiteUrl = websiteUrl;
  if (details.industry.trim()) workspace.workspace.industry = details.industry.trim();
  if (details.summary.trim()) workspace.brand.description = details.summary.trim();
  if (details.targetAudiences.length > 0) {
    workspace.brand.primaryAudience = [...details.targetAudiences];
  }
  if (details.services.length > 0) {
    workspace.brand.serviceAreas = [...details.services];
  }
  if (details.brandVoiceNotes.trim()) {
    workspace.brand.voiceTraits = parseTraits(details.brandVoiceNotes);
  }
  workspace.brand.facts = facts;
}

function readinessFor(
  facts: BrandFact[],
  channels: ChannelProfile[],
): AgentWorkspaceData['brand']['readiness'] {
  const required = facts.filter((fact) => fact.isRequired);
  const confirmedRequired = required.filter(
    (fact) => fact.status === 'confirmed',
  ).length;
  const confirmedFacts = facts.filter((fact) => fact.status === 'confirmed').length;
  const confirmedChannels = channels.filter(
    (channel) => channel.status === 'confirmed',
  ).length;
  const requiredRatio = required.length > 0 ? confirmedRequired / required.length : 0;
  const factRatio = facts.length > 0 ? confirmedFacts / facts.length : 0;
  const channelRatio = channels.length > 0 ? confirmedChannels / channels.length : 0;
  const unresolvedItems = facts.length - confirmedFacts + channels.length - confirmedChannels;

  return {
    score: Math.round(requiredRatio * 60 + factRatio * 25 + channelRatio * 15),
    requiredFacts: { confirmed: confirmedRequired, total: required.length },
    allFacts: { confirmed: confirmedFacts, total: facts.length },
    connectedChannels: { confirmed: confirmedChannels, total: channels.length },
    unresolvedItems,
    summary: unresolvedItems > 0
      ? `Còn ${unresolvedItems} mục cần kiểm tra trước khi vận hành.`
      : 'Các dữ kiện đã nhập được xác nhận; kế hoạch tạo bởi Agent vẫn cần được duyệt.',
  };
}

function normalizedChannelMix(
  platforms: SocialPlatform[],
): StrategyChannelAllocation[] {
  if (platforms.length === 0) return [];
  const base = Math.floor(100 / platforms.length);
  let remaining = 100;
  return platforms.map((platform, index) => {
    const sharePercent = index === platforms.length - 1 ? remaining : base;
    remaining -= sharePercent;
    return {
      platform,
      sharePercent,
      purpose: PLATFORM_COPY[platform].role,
    };
  });
}

function genericStrategy(
  state: AgentOnboardingState,
  channels: ChannelProfile[],
  now: string,
): NinetyDayStrategy {
  const name = state.details.businessName.trim() || 'Workspace mới';
  const industry = state.details.industry.trim() || 'lĩnh vực đang xác nhận';
  const start = new Date(now);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 89);
  const date = (value: Date) => value.toISOString().slice(0, 10);
  const platforms = unique(channels.map((channel) => channel.platform));
  const channelMix = normalizedChannelMix(platforms);
  const audience = state.details.targetAudiences[0] || 'nhóm khách hàng mục tiêu';
  const services = state.details.services.length > 0
    ? state.details.services.slice(0, 3)
    : [`Giải pháp thuộc ${industry}`];

  return {
    title: `Kế hoạch nội dung 90 ngày — ${name}`,
    startDate: date(start),
    endDate: date(end),
    timezone: 'Asia/Ho_Chi_Minh',
    northStar:
      `Tạo nhu cầu phù hợp cho ${name} bằng nội dung hữu ích trong lĩnh vực ${industry}, đồng thời xây niềm tin với ${audience}.`,
    objectives: [
      'Hoàn thiện hồ sơ thương hiệu và vai trò của từng kênh đã chọn',
      'Thiết lập nhịp nội dung có thể duy trì và tái sử dụng',
      'Thu thập dữ liệu thật trước khi tối ưu theo hiệu suất',
    ],
    priorities: [
      {
        id: 'priority-confirm-brand',
        rank: 1,
        title: 'Duyệt hồ sơ thương hiệu',
        reason: 'Các trường người dùng nhập đã được lưu, còn định vị do Agent gợi ý cần kiểm tra.',
        owner: 'Chủ workspace',
        dueDay: 7,
        status: 'in_progress',
      },
      {
        id: 'priority-channel-baseline',
        rank: 2,
        title: 'Chốt vai trò và baseline từng kênh',
        reason:
          'Chưa có connector analytics nên chưa thể dùng hiệu suất lịch sử để phân bổ nguồn lực.',
        owner: 'Chủ workspace',
        dueDay: 14,
        status: 'not_started',
      },
      {
        id: 'priority-pilot',
        rank: 3,
        title: 'Chạy pilot nội dung bốn tuần',
        reason: `Cần mẫu dữ liệu thật trong lĩnh vực ${industry} trước khi mở rộng.`,
        owner: 'Content manager',
        dueDay: 35,
        status: 'not_started',
      },
    ],
    contentPillars: [
      {
        id: 'pillar-expertise',
        name: `Kiến thức ${industry}`,
        description: 'Giải thích vấn đề, phương pháp và lựa chọn để khách hàng có thể áp dụng.',
        sharePercent: 40,
        formats: ['How-to', 'FAQ', 'Checklist', 'Video ngắn'],
        funnelStage: 'awareness',
      },
      {
        id: 'pillar-trust',
        name: 'Niềm tin và bằng chứng',
        description:
          'Trình bày quy trình, đội ngũ và bằng chứng có nguồn; không tạo claim chưa kiểm chứng.',
        sharePercent: 35,
        formats: ['Case study', 'Behind the scenes', 'Quy trình'],
        funnelStage: 'consideration',
      },
      {
        id: 'pillar-offer',
        name: 'Giải pháp và bước tiếp theo',
        description: `Giúp khách hàng hiểu rõ ${services.join(', ')} và cách bắt đầu phù hợp.`,
        sharePercent: 25,
        formats: ['Landing page', 'Q&A', 'So sánh lựa chọn'],
        funnelStage: 'conversion',
      },
    ],
    funnel: [
      {
        id: 'funnel-awareness',
        stage: 'awareness',
        objective: `Được tìm thấy bởi ${audience}`,
        content: ['Nội dung giải đáp vấn đề', 'How-to', 'Video ngắn'],
        cta: 'Lưu hoặc theo dõi nội dung liên quan',
        successMetric: 'Qualified reach và lượt xem hoàn tất',
      },
      {
        id: 'funnel-consideration',
        stage: 'consideration',
        objective: 'Chứng minh mức độ phù hợp và độ tin cậy',
        content: ['Case study có nguồn', 'Quy trình', 'FAQ'],
        cta: 'Xem thêm thông tin hoặc đặt câu hỏi',
        successMetric: 'Click và hội thoại chất lượng',
      },
      {
        id: 'funnel-conversion',
        stage: 'conversion',
        objective: 'Chuyển nhu cầu thành hành động có thể đo lường',
        content: ['Giới thiệu giải pháp', 'Bảng lựa chọn', 'Hướng dẫn bắt đầu'],
        cta: 'Liên hệ hoặc gửi yêu cầu tư vấn',
        successMetric: 'Lead đủ điều kiện',
      },
      {
        id: 'funnel-retention',
        stage: 'retention',
        objective: 'Giữ kết nối và khuyến khích quay lại',
        content: ['Tài liệu sau mua', 'Cập nhật hữu ích', 'Cộng đồng'],
        cta: 'Chia sẻ phản hồi hoặc giới thiệu người phù hợp',
        successMetric: 'Tương tác quay lại và giới thiệu',
      },
    ],
    channelPlan: platforms.map((platform) => ({
      platform,
      role: PLATFORM_COPY[platform].role,
      weeklyCadence: PLATFORM_COPY[platform].cadence,
      priorityFormats: [...PLATFORM_COPY[platform].formats],
      primaryKpi: PLATFORM_COPY[platform].primaryKpi,
    })),
    phases: [
      {
        id: 'phase-foundation',
        name: 'Nền tảng',
        dayRange: 'Ngày 1–30',
        objective: 'Chuẩn hóa thông tin và tạo baseline',
        focus: ['Duyệt facts', 'Chốt vai trò kênh', 'Thiết lập tracking'],
        deliverables: ['Brand Snapshot v1', 'Ma trận kênh', 'Lịch pilot'],
        channelMix: channelMix.map((item) => ({ ...item })),
        kpis: [
          {
            id: 'kpi-baseline',
            label: 'Kênh có baseline',
            target: '100% kênh đã chọn',
            rationale: 'Cần dữ liệu thật trước khi đặt mục tiêu tăng trưởng.',
            dataQuality: 'estimated',
          },
        ],
        satelliteActions: ['Duyệt một đề xuất vệ tinh để pilot'],
      },
      {
        id: 'phase-pilot',
        name: 'Pilot',
        dayRange: 'Ngày 31–60',
        objective: 'Kiểm chứng trụ cột và format bằng dữ liệu thật',
        focus: ['Xuất bản có duyệt', 'Gắn nguồn lead', 'So sánh format'],
        deliverables: ['Báo cáo bốn tuần', 'Danh sách format nên giữ'],
        channelMix: channelMix.map((item) => ({ ...item })),
        kpis: [
          {
            id: 'kpi-sample',
            label: 'Mẫu nội dung có tracking',
            target: 'Tối thiểu 12 mẫu',
            rationale: 'Đủ mẫu ban đầu để tránh tối ưu từ tín hiệu đơn lẻ.',
            dataQuality: 'estimated',
          },
        ],
        satelliteActions: ['Đánh giá pilot vệ tinh theo nguồn lực thực tế'],
      },
      {
        id: 'phase-scale',
        name: 'Mở rộng có kiểm soát',
        dayRange: 'Ngày 61–90',
        objective: 'Tăng đầu tư vào nội dung đã có tín hiệu đáng tin cậy',
        focus: ['Tái sử dụng nội dung', 'Tối ưu CTA', 'Cập nhật rule'],
        deliverables: ['Playbook v1', 'Kế hoạch quý tiếp theo'],
        channelMix: channelMix.map((item) => ({ ...item })),
        kpis: [
          {
            id: 'kpi-qualified-action',
            label: 'Hành động đủ điều kiện',
            target: 'Đặt sau khi có baseline',
            rationale: 'Không tạo mục tiêu số khi chưa có dữ liệu vận hành.',
            dataQuality: 'estimated',
          },
        ],
        satelliteActions: ['Chỉ mở rộng vệ tinh nếu pilot đạt tiêu chí đã duyệt'],
      },
    ],
    status: 'needs_review',
    updatedAt: now,
    confirmedAt: null,
    provenance: [
      {
        id: 'prov-strategy-onboarding',
        sourceType: 'analysis',
        label: 'Khung chiến lược khởi tạo của HIVE-K',
        url: null,
        observedAt: now,
        note:
          'Bản nháp dựa trên dữ liệu người dùng nhập và các nguồn đã chọn; cần duyệt trước khi vận hành.',
      },
    ],
  };
}

function genericSatellites(
  state: AgentOnboardingState,
): SatelliteRecommendation[] {
  const name = state.details.businessName.trim() || 'Thương hiệu mới';
  const industry = state.details.industry.trim() || 'lĩnh vực đang xác nhận';
  const audience = state.details.targetAudiences[0] || 'nhóm khách hàng mục tiêu';
  const slug = toSlug(name);

  return [
    {
      id: 'satellite-community',
      platform: 'facebook',
      priority: 'high',
      status: 'suggested',
      rationale: [
        `Tạo không gian hỏi đáp riêng cho ${audience}`,
        `Thu thập câu hỏi thật trong lĩnh vực ${industry}`,
        'Tách nội dung cộng đồng khỏi kênh thương hiệu chính',
      ],
      projectedImpact: 'Tăng hội thoại chất lượng và tạo nguồn ý tưởng nội dung có ngữ cảnh.',
      effort: 'medium',
      confidence: 0.62,
      dataQuality: 'estimated',
      profile: {
        displayName: `${name} Community`,
        proposedHandle: `@${slug}.community`,
        bio: `Cộng đồng chia sẻ kiến thức và hỏi đáp về ${industry} cùng ${name}.`,
        role: 'Cộng đồng hỏi đáp và nuôi dưỡng nhu cầu',
        audience: [audience],
        contentPillars: ['Hỏi đáp', 'Kinh nghiệm thực tế', 'Tài nguyên hữu ích'],
        formats: ['Bài hỏi đáp', 'Poll', 'Livestream', 'Checklist'],
        tone: 'Cởi mở, tôn trọng và không phán xét',
        cadence: '3 bài + 1 phiên hỏi đáp/tuần',
        cta: 'Đặt câu hỏi hoặc xem tài nguyên phù hợp',
        guardrails: [
          'Không công khai dữ liệu cá nhân khi chưa có chấp thuận',
          'Claim kết quả phải có nguồn và phạm vi',
          'Không biến thảo luận cộng đồng thành tư vấn chuyên môn bắt buộc',
        ],
      },
      nextSteps: [
        'Xác nhận phạm vi cộng đồng',
        'Chỉ định người kiểm duyệt',
        'Chuẩn bị 8–12 nội dung mở đầu',
        'Đánh giá pilot sau 30 ngày',
      ],
      confirmedAt: null,
    },
    {
      id: 'satellite-insights',
      platform: 'youtube',
      priority: 'medium',
      status: 'suggested',
      rationale: [
        `Xây thư viện kiến thức có thể tìm kiếm trong lĩnh vực ${industry}`,
        'Tạo nguồn nội dung dài để tái sử dụng thành format ngắn',
        'Cho khách hàng đánh giá chuyên môn trước khi liên hệ',
      ],
      projectedImpact:
        'Tăng thời gian tiếp xúc với nội dung chuyên môn và lượng truy cập bền vững.',
      effort: 'high',
      confidence: 0.58,
      dataQuality: 'estimated',
      profile: {
        displayName: `${name} Insights`,
        proposedHandle: `@${slug}.insights`,
        bio: `Nội dung chuyên sâu, dễ áp dụng về ${industry} từ ${name}.`,
        role: 'Thư viện chuyên môn và nội dung evergreen',
        audience: [audience],
        contentPillars: ['Giải thích chuyên sâu', 'How-to', 'Case study có nguồn'],
        formats: ['Video 6–12 phút', 'Shorts', 'Playlist', 'Phỏng vấn'],
        tone: 'Có cấu trúc, dễ hiểu và trung thực về giới hạn dữ liệu',
        cadence: '1 video dài + 2 Shorts/tuần',
        cta: 'Xem tài nguyên liên quan hoặc gửi câu hỏi',
        guardrails: [
          'Kiểm tra facts và nguồn trước khi xuất bản',
          'Không sử dụng tài sản có bản quyền khi chưa được phép',
          'Nêu rõ khi nội dung là ví dụ hoặc ước tính',
        ],
      },
      nextSteps: [
        'Chọn ba chủ đề pilot',
        'Thiết kế format thống nhất',
        'Sản xuất ba tập thử nghiệm',
        'Đo retention trước khi mở rộng',
      ],
      confirmedAt: null,
    },
  ];
}

function emptyAnalytics(now: string): WorkspaceAnalytics {
  const to = new Date(now);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);

  return {
    dateRange: {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      comparisonLabel: 'Chưa có kỳ dữ liệu để so sánh',
    },
    dataQuality: 'estimated',
    dataCompletenessPercent: 0,
    dataQualityNote:
      'Chưa có connector analytics hoặc dữ liệu vận hành đã xác minh. Dashboard không tạo số liệu giả; các chỉ số sẽ xuất hiện sau khi có dữ liệu thật.',
    priorities: [
      {
        id: 'priority-connect-analytics',
        severity: 'high',
        title: 'Kết nối nguồn analytics',
        detail: 'Các URL công khai không cung cấp insights riêng tư hoặc lịch sử hiệu suất đầy đủ.',
        recommendedAction: 'Cấp quyền đọc cho tài khoản phù hợp hoặc tải tệp báo cáo đã xuất.',
        relatedView: 'channels',
      },
    ],
    kpis: [],
    channelPerformance: [],
    trend: [],
    contentPillars: [],
    funnel: [],
    insights: [],
  };
}

function filteredRichAnalytics(
  seedAnalytics: WorkspaceAnalytics,
  seed: AgentWorkspaceData,
  resources: SelectedWorkspaceResources,
): WorkspaceAnalytics {
  const allSeedSelected = seed.sources.every((source) =>
    resources.selectedSeedSourceIds.has(source.id)
  );
  if (allSeedSelected) {
    return {
      ...seedAnalytics,
      priorities: seedAnalytics.priorities.map((item) => ({ ...item })),
      kpis: seedAnalytics.kpis.map((item) => ({ ...item })),
      channelPerformance: seedAnalytics.channelPerformance.map((item) => ({ ...item })),
      trend: seedAnalytics.trend.map((item) => ({ ...item })),
      contentPillars: seedAnalytics.contentPillars.map((item) => ({ ...item })),
      funnel: seedAnalytics.funnel.map((item) => ({ ...item })),
      insights: seedAnalytics.insights.map((item) => ({
        ...item,
        relatedChannelIds: [...item.relatedChannelIds],
      })),
    };
  }

  const channelIds = new Set(resources.channels.map((channel) => channel.id));
  const channelPerformance = seedAnalytics.channelPerformance.filter((item) =>
    channelIds.has(item.channelId)
  );
  const reach = channelPerformance.reduce((sum, item) => sum + item.reach, 0);
  const engagements = channelPerformance.reduce(
    (sum, item) => sum + item.engagements,
    0,
  );
  const leads = channelPerformance.reduce((sum, item) => sum + item.leads, 0);
  const formatter = new Intl.NumberFormat('vi-VN', { notation: 'compact' });

  return {
    ...seedAnalytics,
    dataCompletenessPercent: Math.round(
      (resources.selectedSeedSourceIds.size / Math.max(seed.sources.length, 1))
        * seedAnalytics.dataCompletenessPercent,
    ),
    dataQualityNote:
      'Chỉ tổng hợp các kênh đã được chọn trong onboarding. Số liệu còn lại là ước tính công khai vì chưa có connector/API analytics.',
    kpis: [
      {
        id: 'kpi-reach',
        label: 'Tổng tiếp cận ước tính',
        value: reach,
        formattedValue: formatter.format(reach),
        unit: 'count',
        deltaPercent: null,
        goal: 'Nhận biết',
        dataQuality: 'estimated',
      },
      {
        id: 'kpi-engagement',
        label: 'Tương tác ước tính',
        value: engagements,
        formattedValue: formatter.format(engagements),
        unit: 'count',
        deltaPercent: null,
        goal: 'Quan tâm',
        dataQuality: 'estimated',
      },
      {
        id: 'kpi-leads',
        label: 'Lead ước tính',
        value: leads,
        formattedValue: formatter.format(leads),
        unit: 'count',
        deltaPercent: null,
        goal: 'Chuyển đổi',
        dataQuality: 'estimated',
      },
    ],
    channelPerformance: channelPerformance.map((item) => ({ ...item })),
    trend: [],
    contentPillars: [],
    funnel: [],
    insights: seedAnalytics.insights
      .filter(
        (item) =>
          item.relatedChannelIds.length > 0
          && item.relatedChannelIds.every((id) => channelIds.has(id)),
      )
      .map((item) => ({ ...item, relatedChannelIds: [...item.relatedChannelIds] })),
  };
}

function filteredRichStrategy(
  strategy: NinetyDayStrategy,
  channels: ChannelProfile[],
): NinetyDayStrategy {
  const platforms = new Set(channels.map((channel) => channel.platform));
  return {
    ...strategy,
    channelPlan: strategy.channelPlan
      .filter((plan) => platforms.has(plan.platform))
      .map((plan) => ({ ...plan, priorityFormats: [...plan.priorityFormats] })),
    phases: strategy.phases.map((phase) => {
      const keptPlatforms = phase.channelMix
        .filter((allocation) => platforms.has(allocation.platform))
        .map((allocation) => allocation.platform);
      return {
        ...phase,
        focus: [...phase.focus],
        deliverables: [...phase.deliverables],
        channelMix: normalizedChannelMix(keptPlatforms),
        kpis: phase.kpis.map((kpi) => ({ ...kpi })),
        satelliteActions: [...phase.satelliteActions],
      };
    }),
  };
}

function approvedDomains(sources: WorkspaceSource[]): string[] {
  return unique(
    sources
      .filter((source) => source.type === 'website')
      .map((source) => urlHostname(source.url))
      .filter((domain): domain is string => Boolean(domain)),
  );
}

function updateStudioSections(
  sections: StudioConfig['sections'],
  sources: WorkspaceSource[],
  channels: ChannelProfile[],
): StudioConfig['sections'] {
  const readableSources = sources.filter((source) => source.canRead).length;
  return sections.map((section) => {
    if (section.id === 'sources') {
      return {
        ...section,
        completionPercent: sources.length > 0
          ? Math.round((readableSources / sources.length) * 100)
          : 0,
        issues: sources.length - readableSources,
      };
    }
    if (section.id === 'channels') {
      return {
        ...section,
        completionPercent: channels.length > 0 ? 70 : 0,
        issues: channels.filter((channel) => channel.status === 'needs_review').length,
      };
    }
    return { ...section };
  });
}

function genericChannelRules(
  channels: ChannelProfile[],
): StudioConfig['channelRules'] {
  return channels.map((channel) => ({
    id: `channel-rule-${toSlug(channel.id)}`,
    channelId: channel.id,
    role: channel.role,
    tone: channel.tone,
    cadence: channel.cadence,
    contentPillars: [...channel.contentPillars],
    cta: 'Mời người xem thực hiện bước tiếp theo phù hợp; không thúc ép.',
    enabled: true,
  }));
}

function genericStudio(
  seed: AgentWorkspaceData,
  state: AgentOnboardingState,
  resources: SelectedWorkspaceResources,
  now: string,
): StudioConfig {
  const details = state.details;
  const name = details.businessName.trim() || 'Workspace mới';
  const industry = details.industry.trim() || 'Lĩnh vực đang xác nhận';
  const domains = approvedDomains(resources.sources);
  const channelIds = resources.channels.map((channel) => channel.id);
  const voiceTraits = parseTraits(details.brandVoiceNotes);

  return {
    ...seed.studio,
    workspaceName: name,
    industry,
    primaryMarket: details.primaryMarket.trim() || 'Chưa xác nhận',
    publishingMode: 'approval_required',
    workspaceProfile: {
      ...seed.studio.workspaceProfile,
      displayName: name,
      industry,
      defaultLocale: 'vi-VN',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    brandVoice: {
      summary: details.brandVoiceNotes.trim()
        || `Giọng thương hiệu ${name} cần rõ ràng, hữu ích và phù hợp với lĩnh vực ${industry}.`,
      traits: voiceTraits,
      preferredTerms: [...details.services],
      blockedTerms: ['cam kết tuyệt đối', 'tốt nhất chắc chắn', 'kết quả bảo đảm'],
      sample: `Nội dung mẫu cho ${name} sẽ được tạo sau khi hồ sơ giọng thương hiệu được duyệt.`,
      profileName: 'Brand Voice Profile v0 — chờ duyệt',
      emojiPolicy: 'light',
      ctaStyle: 'Nêu bước tiếp theo rõ ràng, không thúc ép',
      platformOverrides: resources.channels.map((channel) => ({
        platform: channel.platform,
        tone: channel.tone,
        maxEmojis: channel.platform === 'linkedin' || channel.platform === 'x' ? 1 : 3,
      })),
    },
    contentRules: [
      {
        id: 'rule-source-claims',
        name: 'Nguồn cho tuyên bố',
        instruction:
          'Mọi số liệu, kết quả hoặc tuyên bố so sánh phải có nguồn và thời điểm quan sát.',
        appliesTo: ['all'],
        level: 'required',
        enabled: true,
      },
      {
        id: 'rule-pii',
        name: 'Bảo vệ dữ liệu cá nhân',
        instruction:
          'Không dùng dữ liệu cá nhân hoặc tài sản riêng tư khi chưa có chấp thuận phù hợp.',
        appliesTo: ['all'],
        level: 'required',
        enabled: true,
      },
      {
        id: 'rule-human-review',
        name: 'Duyệt claim quan trọng',
        instruction:
          'Claim về hiệu quả, giá, pháp lý hoặc sức khỏe phải được người có trách nhiệm duyệt.',
        appliesTo: ['all'],
        level: 'required',
        enabled: true,
      },
    ],
    contentGovernance: {
      requireFactSources: true,
      requireHumanReviewForClaims: true,
      prohibitedClaims: ['Cam kết tuyệt đối', 'Kết quả chắc chắn', 'Tốt nhất không cần bằng chứng'],
      requiredDisclosures: ['Kết quả thực tế có thể khác tùy trường hợp và điều kiện áp dụng'],
      defaultHashtagRange: { min: 3, max: 7 },
      linkPolicy: domains.length > 0 ? 'approved_domains_only' : 'allowed',
      approvedDomains: domains,
    },
    channelRules: genericChannelRules(resources.channels),
    agentInstructions:
      'Ưu tiên facts do người dùng xác nhận; hiển thị nguồn khi dùng claim; không tự xuất bản; không suy diễn metrics khi chưa có dữ liệu analytics.',
    learningEnabled: true,
    learningRules: [],
    sources: resources.sources.map((source) => ({ ...source })),
    agentLearning: {
      ...seed.studio.agentLearning,
      learnFromPerformance: false,
    },
    sections: updateStudioSections(
      seed.studio.sections,
      resources.sources,
      resources.channels,
    ),
    team: [
      {
        id: 'member-owner',
        name: 'Chủ workspace',
        email: details.email.trim(),
        role: 'owner',
        channelIds,
        status: 'active',
        lastActiveAt: now,
      },
    ],
    approvalWorkflows: [
      {
        id: 'approval-standard',
        name: 'Duyệt nội dung tiêu chuẩn',
        contentTypes: ['social_post', 'short_video', 'article'],
        channelIds,
        steps: [{ order: 1, role: 'owner', assigneeId: 'member-owner' }],
        slaHours: 24,
        fallbackMemberId: 'member-owner',
        enabled: true,
      },
    ],
    notifications: seed.studio.notifications.map((rule) => ({
      ...rule,
      channels: [...rule.channels],
      recipientRoles: [...rule.recipientRoles],
    })),
    auditLog: [
      {
        id: 'audit-onboarding-bootstrap',
        occurredAt: now,
        actor: 'HIVE-K Agent',
        action: 'Khởi tạo workspace',
        objectType: 'workspace',
        objectLabel: name,
        detail: `Đã tạo hồ sơ từ ${resources.sources.length} nguồn được chọn và ${
          genericFacts(state, now).length
        } dữ kiện do người dùng cung cấp; không có hành động xuất bản.`,
      },
    ],
    tasks: [
      {
        id: 'task-review-brand',
        title: 'Kiểm tra Brand Snapshot',
        description: 'Duyệt định vị, nhóm khách hàng và giọng thương hiệu trước khi tạo nội dung.',
        priority: 'high',
        status: 'in_progress',
        view: 'brand',
        assigneeId: 'member-owner',
        dueAt: null,
        source: 'agent',
      },
      {
        id: 'task-connect-analytics',
        title: 'Kết nối dữ liệu analytics',
        description: 'Cấp quyền đọc hoặc tải báo cáo để dashboard sử dụng số liệu vận hành thật.',
        priority: 'high',
        status: 'todo',
        view: 'analytics',
        assigneeId: 'member-owner',
        dueAt: null,
        source: 'agent',
      },
      {
        id: 'task-review-strategy',
        title: 'Duyệt kế hoạch 90 ngày',
        description: 'Điều chỉnh mục tiêu, nguồn lực và cadence trước khi triển khai.',
        priority: 'medium',
        status: 'needs_approval',
        view: 'strategy',
        assigneeId: 'member-owner',
        dueAt: null,
        source: 'agent',
      },
    ],
  };
}

function richStudio(
  workspace: AgentWorkspaceData,
  state: AgentOnboardingState,
  resources: SelectedWorkspaceResources,
  now: string,
): StudioConfig {
  const studio = workspace.studio;
  const channelIds = new Set(resources.channels.map((channel) => channel.id));
  const domains = approvedDomains(resources.sources);
  const details = state.details;

  return {
    ...studio,
    workspaceName: workspace.workspace.name,
    industry: workspace.workspace.industry,
    primaryMarket: details.primaryMarket.trim() || studio.primaryMarket,
    workspaceProfile: {
      ...studio.workspaceProfile,
      displayName: workspace.workspace.name,
      industry: workspace.workspace.industry,
    },
    brandVoice: {
      ...studio.brandVoice,
      summary: details.brandVoiceNotes.trim() || studio.brandVoice.summary,
      traits: details.brandVoiceNotes.trim()
        ? parseTraits(details.brandVoiceNotes)
        : [...studio.brandVoice.traits],
      preferredTerms: [...studio.brandVoice.preferredTerms],
      blockedTerms: [...studio.brandVoice.blockedTerms],
      platformOverrides: studio.brandVoice.platformOverrides?.filter((override) =>
        resources.channels.some((channel) => channel.platform === override.platform)
      ),
    },
    contentRules: studio.contentRules.map((rule) => ({
      ...rule,
      appliesTo: [...rule.appliesTo],
    })),
    contentGovernance: {
      ...studio.contentGovernance,
      linkPolicy: domains.length > 0 ? 'approved_domains_only' : 'allowed',
      approvedDomains: domains,
      prohibitedClaims: [...studio.contentGovernance.prohibitedClaims],
      requiredDisclosures: [...studio.contentGovernance.requiredDisclosures],
      defaultHashtagRange: { ...studio.contentGovernance.defaultHashtagRange },
    },
    channelRules: studio.channelRules
      .filter((rule) => channelIds.has(rule.channelId))
      .map((rule) => ({ ...rule, contentPillars: [...rule.contentPillars] }))
      .concat(
        genericChannelRules(resources.channels).filter(
          (rule) => !studio.channelRules.some((existing) => existing.channelId === rule.channelId),
        ),
      ),
    learningRules: studio.learningRules.map((rule) => ({ ...rule })),
    sources: resources.sources.map((source) => ({ ...source })),
    sections: updateStudioSections(
      studio.sections,
      resources.sources,
      resources.channels,
    ),
    team: studio.team.map((member) => ({
      ...member,
      email: member.role === 'owner' && details.email.trim()
        ? details.email.trim()
        : member.email,
      channelIds: member.channelIds.filter((id) => channelIds.has(id)),
    })),
    approvalWorkflows: studio.approvalWorkflows.map((workflow) => ({
      ...workflow,
      contentTypes: [...workflow.contentTypes],
      channelIds: workflow.channelIds.filter((id) => channelIds.has(id)),
      steps: workflow.steps.map((step) => ({ ...step })),
    })),
    notifications: studio.notifications.map((rule) => ({
      ...rule,
      channels: [...rule.channels],
      recipientRoles: [...rule.recipientRoles],
    })),
    auditLog: [
      {
        id: `audit-onboarding-${Date.parse(now)}`,
        occurredAt: now,
        actor: 'HIVE-K Agent',
        action: 'Áp dụng lựa chọn onboarding',
        objectType: 'workspace',
        objectLabel: workspace.workspace.name,
        detail:
          `Workspace chỉ sử dụng ${resources.sources.length} nguồn và ${resources.channels.length} hồ sơ kênh đã được người dùng chọn; không có hành động xuất bản.`,
      },
      ...studio.auditLog.map((entry) => ({ ...entry })),
    ],
    tasks: studio.tasks
      .filter((task) => {
        if (task.id.includes('facebook')) return channelIds.has('channel-facebook');
        if (task.id.includes('tiktok')) return channelIds.has('channel-tiktok');
        return true;
      })
      .map((task) => ({ ...task })),
  };
}

function isSuccessfulTutorXDiscovery(
  state: AgentOnboardingState,
  seed: AgentWorkspaceData,
): boolean {
  if (
    state.discovery.status !== 'complete'
    && state.discovery.status !== 'partial'
  ) {
    return false;
  }
  const seedSourceIds = new Set(seed.sources.map((source) => source.id));
  return state.discovery.sources.some((source) => seedSourceIds.has(source.id));
}

function buildRichWorkspace(
  seed: AgentWorkspaceData,
  state: AgentOnboardingState,
  resources: SelectedWorkspaceResources,
  now: string,
): AgentWorkspaceData {
  const workspace = cloneWorkspace(seed);
  workspace.generatedAt = now;
  workspace.workspace.lastAnalyzedAt = now;
  applyRichDetails(workspace, state, now);
  workspace.sources = resources.sources.map((source) => ({ ...source }));
  workspace.channels = resources.channels.map((channel) => ({ ...channel }));
  workspace.brand.readiness = readinessFor(workspace.brand.facts, workspace.channels);
  workspace.workspace.status = 'needs_review';
  workspace.strategy = filteredRichStrategy(workspace.strategy, workspace.channels);
  workspace.analytics = filteredRichAnalytics(
    workspace.analytics,
    seed,
    resources,
  );
  workspace.studio = richStudio(workspace, state, resources, now);
  return workspace;
}

function buildGenericWorkspace(
  seed: AgentWorkspaceData,
  state: AgentOnboardingState,
  resources: SelectedWorkspaceResources,
  now: string,
): AgentWorkspaceData {
  const name = state.details.businessName.trim() || 'Workspace mới';
  const industry = state.details.industry.trim() || 'Lĩnh vực đang xác nhận';
  const facts = genericFacts(state, now);
  const slug = toSlug(name);
  const voiceTraits = parseTraits(state.details.brandVoiceNotes);
  const workspace: AgentWorkspaceData = {
    schemaVersion: 1,
    seedVersion: seed.seedVersion,
    generatedAt: now,
    workspace: {
      id: `ws-${slug}`,
      slug,
      name,
      industry,
      locale: 'vi-VN',
      timezone: 'Asia/Ho_Chi_Minh',
      websiteUrl: state.details.websiteUrl.trim(),
      status: 'needs_review',
      lastAnalyzedAt: now,
    },
    brand: {
      name,
      tagline: '',
      description: state.details.summary.trim(),
      primaryAudience: state.details.targetAudiences.length > 0
        ? [...state.details.targetAudiences]
        : ['Nhóm khách hàng mục tiêu cần xác nhận'],
      serviceAreas: state.details.services.length > 0
        ? [...state.details.services]
        : [`Giải pháp thuộc ${industry}`],
      voiceTraits,
      readiness: readinessFor(facts, resources.channels),
      facts,
    },
    channels: resources.channels.map((channel) => ({ ...channel })),
    satellites: genericSatellites(state),
    strategy: genericStrategy(state, resources.channels, now),
    analytics: emptyAnalytics(now),
    sources: resources.sources.map((source) => ({ ...source })),
    studio: genericStudio(seed, state, resources, now),
  };

  return workspace;
}

/**
 * Materializes the confirmed onboarding scope into the workspace snapshot that
 * the existing workspace hook already knows how to load. No remote connection
 * is implied: public/manual sources remain read-only unless the onboarding state
 * explicitly records a completed account connection.
 */
export async function materializeOnboardingWorkspace(
  state: AgentOnboardingState,
): Promise<boolean> {
  console.group('[HIVE-K onboarding] Khởi tạo snapshot workspace');

  try {
    const seedModule = await import('../data/the-tutorx-workspace.json');
    const rawSeed: unknown = seedModule.default;
    if (!isAgentWorkspaceData(rawSeed)) {
      throw new Error('Workspace seed không đúng schema v1.');
    }

    const seed = cloneWorkspace(rawSeed);
    const now = new Date().toISOString();
    const tutorXPath = isSuccessfulTutorXDiscovery(state, seed);
    const resources = buildSelectedResources(state, seed, tutorXPath, now);
    const snapshot = tutorXPath
      ? buildRichWorkspace(seed, state, resources, now)
      : buildGenericWorkspace(seed, state, resources, now);

    if (!isAgentWorkspaceData(snapshot)) {
      throw new Error('Snapshot sau onboarding không đúng schema workspace v1.');
    }

    console.info({
      profile: tutorXPath ? 'discovered' : 'manual',
      facts: snapshot.brand.facts.length,
      sources: snapshot.sources.length,
      channels: snapshot.channels.length,
      analyticsCompleteness: snapshot.analytics.dataCompletenessPercent,
    });
    return saveAgentWorkspaceDemo(snapshot);
  } catch (error: unknown) {
    console.info('Không thể khởi tạo snapshot workspace.', error);
    return false;
  } finally {
    console.groupEnd();
  }
}
