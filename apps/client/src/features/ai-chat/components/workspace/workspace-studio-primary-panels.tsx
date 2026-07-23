import {
  type StudioConfigChangeHandler,
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
} from '@/features/ai-chat/components/workspace/workspace-studio-controls';
import type {
  BrandVoiceConfig,
  ChannelRule,
  ContentRule,
  ContentRulesConfig,
  WorkspaceSource,
  WorkspaceStudioConfig,
} from '@/features/ai-chat/types/workspace-types';
import {
  BookOpenCheck,
  Building2,
  Database,
  ExternalLink,
  FileCheck2,
  Languages,
  MessageSquareText,
  Radio,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type StudioPanelProps = {
  config: WorkspaceStudioConfig;
  onChange: StudioConfigChangeHandler;
  idPrefix: string;
};

const PLATFORM_LABELS: Record<string, string> = {
  website: 'Website',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  x: 'X',
};

const SOURCE_TYPE_LABELS: Record<WorkspaceSource['type'], string> = {
  website: 'Website',
  social: 'Mạng xã hội',
  drive: 'Google Drive',
  file: 'Tệp tài liệu',
};

const SOURCE_STATUS_LABELS: Record<WorkspaceSource['status'], string> = {
  connected: 'Đã kết nối',
  public_only: 'Chỉ dữ liệu công khai',
  needs_reconnect: 'Cần kết nối lại',
};

const SYNC_TIME_FORMATTER = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

function sourceStatusVariant(
  status: WorkspaceSource['status'],
): 'success' | 'warning' | 'neutral' {
  if (status === 'connected') return 'success';
  if (status === 'needs_reconnect') return 'warning';
  return 'neutral';
}

function formatSyncTime(value: string | null): string {
  if (!value) return 'Chưa đồng bộ';

  return SYNC_TIME_FORMATTER.format(new Date(value));
}

export function WorkspaceVoicePanel({
  config,
  onChange,
  idPrefix,
}: StudioPanelProps) {
  function updateBrandVoice(patch: Partial<BrandVoiceConfig>): void {
    onChange('brandVoice', { ...config.brandVoice, ...patch });
  }

  return (
    <div className='space-y-4'>
      <StudioPanelCard
        title='Workspace'
        description='Thiết lập ngữ cảnh mặc định để lịch, nội dung và báo cáo dùng cùng một thị trường.'
        icon={<Building2 className='size-4' aria-hidden />}
      >
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          <StudioTextField
            id={`${idPrefix}-workspace-name`}
            label='Tên workspace'
            value={config.workspaceName}
            onChange={(value) => {
              onChange('workspaceName', value);
              onChange('workspaceProfile', {
                ...config.workspaceProfile,
                displayName: value,
              });
            }}
            required
            autoComplete='organization'
          />
          <StudioTextField
            id={`${idPrefix}-industry`}
            label='Lĩnh vực'
            value={config.industry}
            onChange={(value) => {
              onChange('industry', value);
              onChange('workspaceProfile', {
                ...config.workspaceProfile,
                industry: value,
              });
            }}
            required
          />
          <StudioTextField
            id={`${idPrefix}-market`}
            label='Thị trường chính'
            value={config.primaryMarket}
            onChange={(value) => onChange('primaryMarket', value)}
            required
          />
          <StudioSelectField
            id={`${idPrefix}-language`}
            label='Ngôn ngữ nội dung'
            value={config.language}
            onChange={(value) => {
              const language = value as WorkspaceStudioConfig['language'];
              onChange('language', language);
              onChange('workspaceProfile', {
                ...config.workspaceProfile,
                defaultLocale: language === 'vi' ? 'vi-VN' : 'en-US',
              });
            }}
            options={[
              { value: 'vi', label: 'Tiếng Việt' },
              { value: 'en', label: 'English' },
            ]}
          />
          <StudioTextField
            id={`${idPrefix}-timezone`}
            label='Múi giờ'
            value={config.timezone}
            onChange={(value) => {
              onChange('timezone', value);
              onChange('workspaceProfile', {
                ...config.workspaceProfile,
                timezone: value,
              });
            }}
            hint='Dùng cho lịch đăng, SLA duyệt và báo cáo.'
            required
          />
          <StudioSelectField
            id={`${idPrefix}-week-start`}
            label='Ngày bắt đầu tuần'
            value={config.workspaceProfile.weekStartsOn}
            onChange={(value) =>
              onChange('workspaceProfile', {
                ...config.workspaceProfile,
                weekStartsOn: value as WorkspaceStudioConfig['workspaceProfile']['weekStartsOn'],
              })}
            options={[
              { value: 'monday', label: 'Thứ Hai' },
              { value: 'sunday', label: 'Chủ Nhật' },
            ]}
          />
          <StudioNumberField
            id={`${idPrefix}-retention`}
            label='Thời gian lưu dữ liệu (ngày)'
            value={config.workspaceProfile.dataRetentionDays}
            onChange={(value) =>
              onChange('workspaceProfile', {
                ...config.workspaceProfile,
                dataRetentionDays: value,
              })}
            min={30}
            max={3650}
          />
        </div>

        <div className='mt-4'>
          <StudioToggle
            id={`${idPrefix}-autosave`}
            label='Tự động lưu bản nháp'
            description='Lưu thay đổi trong trình soạn thảo; cấu hình Studio vẫn cần xác nhận ở cuối trang.'
            checked={config.autoSave}
            onChange={(checked) => onChange('autoSave', checked)}
          />
        </div>
      </StudioPanelCard>

      <StudioPanelCard
        title='Brand voice'
        description='Những nguyên tắc này được áp dụng trước khi HIVE-K đề xuất nội dung cho từng kênh.'
        icon={<MessageSquareText className='size-4' aria-hidden />}
      >
        <div className='grid gap-4 lg:grid-cols-2'>
          <StudioTextField
            id={`${idPrefix}-voice-profile`}
            label='Tên hồ sơ giọng văn'
            value={config.brandVoice.profileName ?? ''}
            onChange={(value) => updateBrandVoice({ profileName: value })}
            placeholder='Ví dụ: Brand Voice v1'
          />
          <StudioSelectField
            id={`${idPrefix}-emoji-policy`}
            label='Mức sử dụng emoji'
            value={config.brandVoice.emojiPolicy ?? 'light'}
            onChange={(value) =>
              updateBrandVoice({
                emojiPolicy: value as NonNullable<BrandVoiceConfig['emojiPolicy']>,
              })}
            options={[
              { value: 'none', label: 'Không sử dụng' },
              { value: 'light', label: 'Ít, có chọn lọc' },
              { value: 'moderate', label: 'Vừa phải' },
            ]}
          />
          <div className='lg:col-span-2'>
            <StudioTextAreaField
              id={`${idPrefix}-voice-summary`}
              label='Tóm tắt giọng văn'
              value={config.brandVoice.summary}
              onChange={(value) => updateBrandVoice({ summary: value })}
              rows={4}
              required
            />
          </div>
          <StudioListField
            id={`${idPrefix}-voice-traits`}
            label='Đặc điểm giọng văn'
            values={config.brandVoice.traits}
            onChange={(values) => updateBrandVoice({ traits: values })}
            rows={4}
          />
          <StudioListField
            id={`${idPrefix}-preferred-terms`}
            label='Từ ngữ ưu tiên'
            values={config.brandVoice.preferredTerms}
            onChange={(values) => updateBrandVoice({ preferredTerms: values })}
            rows={4}
          />
          <StudioListField
            id={`${idPrefix}-blocked-terms`}
            label='Từ ngữ cần tránh'
            values={config.brandVoice.blockedTerms}
            onChange={(values) => updateBrandVoice({ blockedTerms: values })}
            hint='Mỗi dòng là một từ hoặc cụm từ không được dùng.'
            rows={4}
          />
          <StudioTextAreaField
            id={`${idPrefix}-cta-style`}
            label='Cách viết lời kêu gọi hành động'
            value={config.brandVoice.ctaStyle ?? ''}
            onChange={(value) => updateBrandVoice({ ctaStyle: value })}
            rows={4}
          />
          <div className='lg:col-span-2'>
            <StudioTextAreaField
              id={`${idPrefix}-voice-sample`}
              label='Đoạn mẫu đã duyệt'
              value={config.brandVoice.sample}
              onChange={(value) => updateBrandVoice({ sample: value })}
              hint='Dùng một đoạn thể hiện rõ cách thương hiệu giao tiếp; không cần đưa toàn bộ bài viết.'
              rows={6}
            />
          </div>
        </div>

        {config.brandVoice.platformOverrides?.length
          ? (
            <div className='mt-5 space-y-2'>
              <div className='flex items-center gap-2'>
                <Languages className='size-4 text-foreground-muted' aria-hidden />
                <h4 className='text-xs font-extrabold uppercase tracking-[0.1em] text-foreground-muted'>
                  Điều chỉnh theo nền tảng
                </h4>
              </div>
              {config.brandVoice.platformOverrides.map((override, index) => (
                <StudioDisclosure
                  key={`${override.platform}-${index}`}
                  title={PLATFORM_LABELS[override.platform] ?? override.platform}
                  description={override.tone}
                >
                  <div className='grid gap-4 sm:grid-cols-[1fr_10rem]'>
                    <StudioTextField
                      id={`${idPrefix}-platform-tone-${index}`}
                      label='Giọng điệu riêng'
                      value={override.tone}
                      onChange={(value) =>
                        updateBrandVoice({
                          platformOverrides:
                            config.brandVoice.platformOverrides?.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, tone: value } : item
                            ) ?? [],
                        })}
                    />
                    <StudioNumberField
                      id={`${idPrefix}-platform-emojis-${index}`}
                      label='Emoji tối đa'
                      value={override.maxEmojis}
                      onChange={(value) =>
                        updateBrandVoice({
                          platformOverrides:
                            config.brandVoice.platformOverrides?.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, maxEmojis: value } : item
                            ) ?? [],
                        })}
                      min={0}
                      max={20}
                    />
                  </div>
                </StudioDisclosure>
              ))}
            </div>
          )
          : null}
      </StudioPanelCard>
    </div>
  );
}

export function ContentChannelRulesPanel({
  config,
  onChange,
  idPrefix,
}: StudioPanelProps) {
  function updateGovernance(patch: Partial<ContentRulesConfig>): void {
    onChange('contentGovernance', { ...config.contentGovernance, ...patch });
  }

  function updateContentRule(ruleId: string, patch: Partial<ContentRule>): void {
    onChange(
      'contentRules',
      config.contentRules.map((rule) => rule.id === ruleId ? { ...rule, ...patch } : rule),
    );
  }

  function updateChannelRule(ruleId: string, patch: Partial<ChannelRule>): void {
    onChange(
      'channelRules',
      config.channelRules.map((rule) => rule.id === ruleId ? { ...rule, ...patch } : rule),
    );
  }

  function getChannelLabel(channelId: string): string {
    return (
      config.sources.find((source) => source.channelId === channelId)?.name
        ?? channelId
    );
  }

  return (
    <div className='space-y-4'>
      <StudioPanelCard
        title='An toàn nội dung'
        description='Kiểm tra dữ kiện và thông tin nhạy cảm trước khi nội dung đi vào hàng chờ duyệt.'
        icon={<ShieldCheck className='size-4' aria-hidden />}
      >
        <div className='grid gap-3 lg:grid-cols-2'>
          <StudioToggle
            id={`${idPrefix}-brand-safety`}
            label='Kiểm tra an toàn thương hiệu'
            description='Đánh dấu nội dung trái với rule, tuyên bố bị cấm hoặc giọng văn đã khóa.'
            checked={config.brandSafetyEnabled}
            onChange={(checked) => onChange('brandSafetyEnabled', checked)}
          />
          <StudioToggle
            id={`${idPrefix}-pii`}
            label='Bảo vệ dữ liệu cá nhân'
            description='Cảnh báo số điện thoại, email và dữ liệu định danh trước khi dùng trong nội dung.'
            checked={config.piiProtectionEnabled}
            onChange={(checked) => onChange('piiProtectionEnabled', checked)}
          />
          <StudioToggle
            id={`${idPrefix}-fact-sources`}
            label='Bắt buộc có nguồn cho dữ kiện'
            description='Nội dung chứa dữ kiện không có bằng chứng sẽ cần bổ sung trước khi duyệt.'
            checked={config.contentGovernance.requireFactSources}
            onChange={(checked) => updateGovernance({ requireFactSources: checked })}
          />
          <StudioToggle
            id={`${idPrefix}-claims-review`}
            label='Duyệt thủ công các cam kết'
            description='Giá, kết quả, ưu đãi và tuyên bố quan trọng luôn cần người có quyền xác nhận.'
            checked={config.contentGovernance.requireHumanReviewForClaims}
            onChange={(checked) => updateGovernance({ requireHumanReviewForClaims: checked })}
          />
        </div>

        <div className='mt-4 grid gap-4 lg:grid-cols-2'>
          <StudioListField
            id={`${idPrefix}-prohibited-claims`}
            label='Cam kết không được sử dụng'
            values={config.contentGovernance.prohibitedClaims}
            onChange={(values) => updateGovernance({ prohibitedClaims: values })}
          />
          <StudioListField
            id={`${idPrefix}-required-disclosures`}
            label='Thông tin bắt buộc công bố'
            values={config.contentGovernance.requiredDisclosures}
            onChange={(values) => updateGovernance({ requiredDisclosures: values })}
          />
          <StudioSelectField
            id={`${idPrefix}-link-policy`}
            label='Chính sách liên kết'
            value={config.contentGovernance.linkPolicy}
            onChange={(value) =>
              updateGovernance({
                linkPolicy: value as ContentRulesConfig['linkPolicy'],
              })}
            options={[
              { value: 'allowed', label: 'Cho phép mọi liên kết' },
              {
                value: 'approved_domains_only',
                label: 'Chỉ tên miền đã duyệt',
              },
              { value: 'disabled', label: 'Không chèn liên kết' },
            ]}
          />
          <StudioListField
            id={`${idPrefix}-approved-domains`}
            label='Tên miền đã duyệt'
            values={config.contentGovernance.approvedDomains}
            onChange={(values) => updateGovernance({ approvedDomains: values })}
            rows={3}
          />
          <div className='grid grid-cols-2 gap-3 lg:col-span-2 lg:max-w-md'>
            <StudioNumberField
              id={`${idPrefix}-hashtag-min`}
              label='Hashtag tối thiểu'
              value={config.contentGovernance.defaultHashtagRange.min}
              onChange={(value) =>
                updateGovernance({
                  defaultHashtagRange: {
                    ...config.contentGovernance.defaultHashtagRange,
                    min: value,
                  },
                })}
              min={0}
              max={config.contentGovernance.defaultHashtagRange.max}
            />
            <StudioNumberField
              id={`${idPrefix}-hashtag-max`}
              label='Hashtag tối đa'
              value={config.contentGovernance.defaultHashtagRange.max}
              onChange={(value) =>
                updateGovernance({
                  defaultHashtagRange: {
                    ...config.contentGovernance.defaultHashtagRange,
                    max: value,
                  },
                })}
              min={config.contentGovernance.defaultHashtagRange.min}
              max={30}
            />
          </div>
        </div>
      </StudioPanelCard>

      <StudioPanelCard
        title='Rule nội dung'
        description='Mở từng rule để kiểm tra phạm vi và nội dung hướng dẫn; rule bắt buộc sẽ chặn bước duyệt.'
        icon={<BookOpenCheck className='size-4' aria-hidden />}
      >
        {config.contentRules.length
          ? (
            <div className='space-y-2'>
              {config.contentRules.map((rule, index) => (
                <StudioDisclosure
                  key={rule.id}
                  title={rule.name}
                  description={rule.instruction}
                  defaultOpen={index === 0}
                  meta={
                    <StudioStatusPill tone={rule.enabled ? 'success' : 'neutral'}>
                      {rule.enabled
                        ? rule.level === 'required'
                          ? 'Bắt buộc'
                          : 'Cảnh báo'
                        : 'Đang tắt'}
                    </StudioStatusPill>
                  }
                >
                  <div className='grid gap-4 lg:grid-cols-2'>
                    <StudioToggle
                      id={`${idPrefix}-content-rule-enabled-${rule.id}`}
                      label='Áp dụng rule'
                      description='Rule bị tắt vẫn được giữ để có thể kích hoạt lại sau.'
                      checked={rule.enabled}
                      onChange={(checked) => updateContentRule(rule.id, { enabled: checked })}
                    />
                    <StudioSelectField
                      id={`${idPrefix}-content-rule-level-${rule.id}`}
                      label='Mức xử lý'
                      value={rule.level}
                      onChange={(value) =>
                        updateContentRule(rule.id, {
                          level: value as ContentRule['level'],
                        })}
                      options={[
                        { value: 'required', label: 'Bắt buộc xử lý' },
                        { value: 'warning', label: 'Cảnh báo để duyệt' },
                      ]}
                    />
                    <StudioTextField
                      id={`${idPrefix}-content-rule-name-${rule.id}`}
                      label='Tên rule'
                      value={rule.name}
                      onChange={(value) => updateContentRule(rule.id, { name: value })}
                      required
                    />
                    <StudioListField
                      id={`${idPrefix}-content-rule-scope-${rule.id}`}
                      label='Phạm vi áp dụng'
                      values={rule.appliesTo}
                      onChange={(values) => updateContentRule(rule.id, { appliesTo: values })}
                      rows={3}
                    />
                    <div className='lg:col-span-2'>
                      <StudioTextAreaField
                        id={`${idPrefix}-content-rule-instruction-${rule.id}`}
                        label='Hướng dẫn'
                        value={rule.instruction}
                        onChange={(value) => updateContentRule(rule.id, { instruction: value })}
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                </StudioDisclosure>
              ))}
            </div>
          )
          : (
            <StudioEmptyState>
              Chưa có rule nội dung. Các kiểm tra an toàn chung ở trên vẫn được áp dụng.
            </StudioEmptyState>
          )}
      </StudioPanelCard>

      <StudioPanelCard
        title='Vai trò và rule theo kênh'
        description='Giữ khác biệt về mục tiêu, nhịp đăng và CTA mà không làm thay đổi brand voice cốt lõi.'
        icon={<Radio className='size-4' aria-hidden />}
      >
        {config.channelRules.length
          ? (
            <div className='space-y-2'>
              {config.channelRules.map((rule, index) => (
                <StudioDisclosure
                  key={rule.id}
                  title={getChannelLabel(rule.channelId)}
                  description={`${rule.role} · ${rule.cadence}`}
                  defaultOpen={index === 0}
                  meta={
                    <StudioStatusPill tone={rule.enabled ? 'success' : 'neutral'}>
                      {rule.enabled ? 'Đang áp dụng' : 'Đang tắt'}
                    </StudioStatusPill>
                  }
                >
                  <div className='grid gap-4 lg:grid-cols-2'>
                    <StudioToggle
                      id={`${idPrefix}-channel-rule-enabled-${rule.id}`}
                      label='Áp dụng rule kênh'
                      description='Khi tắt, kênh dùng brand voice và nhịp nội dung mặc định.'
                      checked={rule.enabled}
                      onChange={(checked) => updateChannelRule(rule.id, { enabled: checked })}
                    />
                    <StudioTextField
                      id={`${idPrefix}-channel-rule-role-${rule.id}`}
                      label='Vai trò kênh'
                      value={rule.role}
                      onChange={(value) => updateChannelRule(rule.id, { role: value })}
                    />
                    <StudioTextField
                      id={`${idPrefix}-channel-rule-tone-${rule.id}`}
                      label='Giọng điệu'
                      value={rule.tone}
                      onChange={(value) => updateChannelRule(rule.id, { tone: value })}
                    />
                    <StudioTextField
                      id={`${idPrefix}-channel-rule-cadence-${rule.id}`}
                      label='Nhịp đăng'
                      value={rule.cadence}
                      onChange={(value) => updateChannelRule(rule.id, { cadence: value })}
                    />
                    <StudioListField
                      id={`${idPrefix}-channel-rule-pillars-${rule.id}`}
                      label='Trụ cột nội dung'
                      values={rule.contentPillars}
                      onChange={(values) => updateChannelRule(rule.id, { contentPillars: values })}
                    />
                    <StudioTextAreaField
                      id={`${idPrefix}-channel-rule-cta-${rule.id}`}
                      label='Quy tắc CTA'
                      value={rule.cta}
                      onChange={(value) => updateChannelRule(rule.id, { cta: value })}
                      rows={4}
                    />
                  </div>
                </StudioDisclosure>
              ))}
            </div>
          )
          : (
            <StudioEmptyState>
              Chưa có rule riêng theo kênh. Brand voice chung đang được dùng cho mọi kênh.
            </StudioEmptyState>
          )}
      </StudioPanelCard>
    </div>
  );
}

export function SourcesPermissionsPanel({
  config,
  onChange,
  idPrefix,
}: StudioPanelProps) {
  function updateSource(sourceId: string, patch: Partial<WorkspaceSource>): void {
    onChange(
      'sources',
      config.sources.map((source) => source.id === sourceId ? { ...source, ...patch } : source),
    );
  }

  const readableSources = config.sources.filter((source) => source.canRead).length;
  const writableSources = config.sources.filter((source) => source.canWrite).length;

  return (
    <div className='space-y-4'>
      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='rounded-2xl border border-primary-soft bg-card p-4'>
          <p className='text-xs font-bold text-foreground-muted'>Tổng nguồn</p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>
            {config.sources.length}
          </p>
          <p className='mt-1 text-xs text-foreground-muted'>Trong workspace này</p>
        </div>
        <div className='rounded-2xl border border-primary-soft bg-card p-4'>
          <p className='text-xs font-bold text-foreground-muted'>Quyền đọc</p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>
            {readableSources}/{config.sources.length}
          </p>
          <p className='mt-1 text-xs text-foreground-muted'>Nguồn có thể đồng bộ</p>
        </div>
        <div className='rounded-2xl border border-primary-soft bg-card p-4'>
          <p className='text-xs font-bold text-foreground-muted'>Quyền ghi/đăng</p>
          <p className='mt-2 text-2xl font-extrabold text-foreground'>
            {writableSources}/{config.sources.length}
          </p>
          <p className='mt-1 text-xs text-foreground-muted'>Được cấp riêng từng nguồn</p>
        </div>
      </div>

      <StudioPanelCard
        title='Nguồn và phạm vi quyền'
        description='Mỗi nguồn có quyền độc lập. Thay đổi quyền không xóa dữ liệu đã lưu, nhưng có thể dừng đồng bộ mới.'
        icon={<Database className='size-4' aria-hidden />}
      >
        {config.sources.length
          ? (
            <div className='space-y-2'>
              {config.sources.map((source, index) => (
                <StudioDisclosure
                  key={source.id}
                  title={source.name}
                  description={`${SOURCE_TYPE_LABELS[source.type]} · Đồng bộ ${
                    formatSyncTime(source.lastSyncedAt)
                  }`}
                  defaultOpen={index === 0}
                  meta={
                    <StudioStatusPill tone={sourceStatusVariant(source.status)}>
                      {SOURCE_STATUS_LABELS[source.status]}
                    </StudioStatusPill>
                  }
                >
                  {source.status === 'needs_reconnect'
                    ? (
                      <div className='mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900'>
                        <FileCheck2 className='mt-0.5 size-4 shrink-0' aria-hidden />
                        <p>
                          Nguồn này cần được kết nối lại. Dữ liệu đã lưu vẫn còn nhưng thay đổi mới
                          chưa thể đồng bộ.
                        </p>
                      </div>
                    )
                    : null}

                  <div className='grid gap-4 lg:grid-cols-2'>
                    <StudioTextAreaField
                      id={`${idPrefix}-source-scope-${source.id}`}
                      label='Phạm vi dữ liệu'
                      value={source.scope}
                      onChange={(value) => updateSource(source.id, { scope: value })}
                      rows={3}
                    />
                    <StudioSelectField
                      id={`${idPrefix}-source-sync-${source.id}`}
                      label='Tần suất đồng bộ'
                      value={source.syncFrequency ?? 'manual'}
                      onChange={(value) =>
                        updateSource(source.id, {
                          syncFrequency: value as NonNullable<
                            WorkspaceSource['syncFrequency']
                          >,
                        })}
                      options={[
                        { value: 'manual', label: 'Thủ công' },
                        { value: 'daily', label: 'Hằng ngày' },
                        { value: 'weekly', label: 'Hằng tuần' },
                      ]}
                    />
                    <StudioToggle
                      id={`${idPrefix}-source-read-${source.id}`}
                      label='Cho phép đọc'
                      description='Đọc nội dung trong đúng phạm vi đã chọn để cập nhật tri thức.'
                      checked={source.canRead}
                      onChange={(checked) =>
                        updateSource(source.id, {
                          canRead: checked,
                          canWrite: checked ? source.canWrite : false,
                          permission: checked
                            ? source.permission
                            : 'read_only',
                          includeInAgentKnowledge: checked
                            ? source.includeInAgentKnowledge
                            : false,
                        })}
                    />
                    <StudioToggle
                      id={`${idPrefix}-source-write-${source.id}`}
                      label={source.type === 'social' ? 'Cho phép đăng' : 'Cho phép ghi'}
                      description={source.status !== 'connected'
                        ? 'Kết nối tài khoản trước khi cấp quyền ghi hoặc đăng.'
                        : source.type === 'social'
                        ? 'Cho phép đưa nội dung đã duyệt lên đúng tài khoản này.'
                        : 'Chỉ bật khi connector hỗ trợ cập nhật trở lại nguồn.'}
                      checked={source.canWrite}
                      onChange={(checked) =>
                        updateSource(source.id, {
                          canRead: checked ? true : source.canRead,
                          canWrite: checked,
                          permission: checked ? 'read_publish' : 'read_only',
                        })}
                      disabled={source.status !== 'connected'}
                    />
                    <div className='lg:col-span-2'>
                      <StudioToggle
                        id={`${idPrefix}-source-knowledge-${source.id}`}
                        label='Dùng trong tri thức của Agent'
                        description='Cho phép HIVE-K trích dẫn dữ kiện từ nguồn này khi lập kế hoạch và tạo nội dung.'
                        checked={source.includeInAgentKnowledge ?? source.canRead}
                        onChange={(checked) =>
                          updateSource(source.id, {
                            includeInAgentKnowledge: checked,
                          })}
                        disabled={!source.canRead}
                      />
                    </div>
                  </div>

                  {source.url
                    ? (
                      <a
                        href={source.url}
                        target='_blank'
                        rel='noreferrer'
                        className='mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs font-bold text-[var(--color-tech-blue)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary/40'
                      >
                        <ExternalLink className='size-4' aria-hidden />
                        Mở nguồn để kiểm tra
                      </a>
                    )
                    : null}
                </StudioDisclosure>
              ))}
            </div>
          )
          : (
            <StudioEmptyState>
              Chưa có nguồn trong workspace. Kết nối một nguồn để Agent có dữ kiện được kiểm chứng.
            </StudioEmptyState>
          )}
      </StudioPanelCard>

      <div className='rounded-2xl border border-primary-soft bg-primary-soft p-4 sm:p-5'>
        <div className='flex items-start gap-3'>
          <span className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-amber-700'>
            <Sparkles className='size-4' aria-hidden />
          </span>
          <div>
            <h3 className='text-sm font-extrabold text-foreground'>
              Nguyên tắc quyền tối thiểu
            </h3>
            <p className='mt-1 text-xs leading-5 text-foreground-muted'>
              Chỉ cấp quyền ghi hoặc đăng cho nguồn thực sự cần xuất bản. Quyền đọc vẫn đủ để phân
              tích và gợi ý nội dung.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
