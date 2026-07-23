'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { loadAgentWorkspaceDemo, saveAgentWorkspaceDemo } from '../services/workspace-demo-service';
import type {
  AgentWorkspaceData,
  BrandFact,
  BrandFactPatch,
  BrandReadiness,
  ChannelProfile,
  ChannelProfilePatch,
  NinetyDayStrategyPatch,
  SatelliteRecommendation,
  SatelliteRecommendationPatch,
  StudioConfigPatch,
  UseAgentWorkspaceResult,
  WorkspaceSource,
} from '../types/workspace-types';

function ratio(confirmed: number, total: number): number {
  return total === 0 ? 1 : confirmed / total;
}

function calculateReadiness(
  facts: BrandFact[],
  channels: ChannelProfile[],
): BrandReadiness {
  const requiredFacts = facts.filter((fact) => fact.isRequired);
  const confirmedRequired = requiredFacts.filter(
    (fact) => fact.status === 'confirmed',
  ).length;
  const confirmedFacts = facts.filter(
    (fact) => fact.status === 'confirmed',
  ).length;
  const confirmedChannelProfiles = channels.filter(
    (channel) => channel.status === 'confirmed',
  ).length;
  const connectedChannels = channels.filter(
    (channel) => channel.connectionStatus === 'connected',
  ).length;
  const unresolvedItems = facts.length
    - confirmedFacts
    + (channels.length - confirmedChannelProfiles)
    + (channels.length - connectedChannels);
  const score = Math.round(
    (ratio(confirmedRequired, requiredFacts.length) * 0.55
      + ratio(confirmedFacts, facts.length) * 0.25
      + ratio(connectedChannels, channels.length) * 0.2)
      * 100,
  );

  return {
    score,
    requiredFacts: {
      confirmed: confirmedRequired,
      total: requiredFacts.length,
    },
    allFacts: { confirmed: confirmedFacts, total: facts.length },
    connectedChannels: {
      confirmed: connectedChannels,
      total: channels.length,
    },
    unresolvedItems,
    summary: unresolvedItems === 0
      ? 'Hồ sơ đã được xác nhận đầy đủ và sẵn sàng cho các bước tiếp theo.'
      : `Còn ${unresolvedItems} mục về hồ sơ hoặc kết nối cần xử lý trước khi xuất bản.`,
  };
}

function logMutation(label: string, detail: string): void {
  console.group(`[HIVE-K demo] ${label}`);
  console.info(detail);
  console.info('Đã lưu snapshot mới vào localStorage nếu trình duyệt cho phép.');
  console.groupEnd();
}

function getFactValue(
  facts: BrandFact[],
  factId: string,
  fallback: string,
): string {
  return facts.find((fact) => fact.id === factId)?.value ?? fallback;
}

function updateSourcesForChannel(
  sources: WorkspaceSource[],
  channel: ChannelProfile,
): WorkspaceSource[] {
  return sources.map((source) =>
    source.channelId === channel.id
      ? {
        ...source,
        name: `${channel.displayName} (${channel.platform})`,
        url: channel.url,
        status: channel.connectionStatus === 'connected'
          ? 'connected'
          : channel.connectionStatus === 'needs_reconnect'
          ? 'needs_reconnect'
          : 'public_only',
        canRead: channel.canRead,
        canWrite: channel.canPublish,
      }
      : source
  );
}

export function useAgentWorkspace(): UseAgentWorkspaceResult {
  const [data, setData] = useState<AgentWorkspaceData | null>(null);
  const [status, setStatus] = useState<UseAgentWorkspaceResult['status']>('loading');
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef<AgentWorkspaceData | null>(null);
  const requestIdRef = useRef(0);

  const reload = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setError(null);

    try {
      const workspace = await loadAgentWorkspaceDemo();
      if (requestId !== requestIdRef.current) return;

      dataRef.current = workspace;
      setData(workspace);
      setStatus('success');
    } catch (loadError: unknown) {
      if (requestId !== requestIdRef.current) return;

      const message = loadError instanceof Error
        ? loadError.message
        : 'Không thể nạp dữ liệu workspace.';
      setError(message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void reload();

    return () => {
      requestIdRef.current += 1;
    };
  }, [reload]);

  const commit = useCallback(
    (
      mutation: (current: AgentWorkspaceData) => AgentWorkspaceData,
      label: string,
      detail: string,
    ): boolean => {
      const current = dataRef.current;
      if (!current) return false;

      const next = mutation(current);
      if (next === current) return true;

      dataRef.current = next;
      setData(next);
      const persisted = saveAgentWorkspaceDemo(next);
      logMutation(label, detail);
      return persisted;
    },
    [],
  );

  const updateFact = useCallback(
    (factId: string, patch: BrandFactPatch): void => {
      commit(
        (current) => {
          let changed = false;
          const now = new Date().toISOString();
          const facts = current.brand.facts.map((fact) => {
            if (fact.id !== factId) return fact;
            changed = true;

            return {
              ...fact,
              ...patch,
              dataQuality: 'user_provided' as const,
              confidence: 1,
              status: 'needs_review' as const,
              updatedAt: now,
              confirmedAt: null,
              provenance: [
                ...fact.provenance,
                {
                  id: `prov-edit-${fact.id}-${Date.now()}`,
                  sourceType: 'user' as const,
                  label: 'Chỉnh sửa trong workspace',
                  url: null,
                  observedAt: now,
                  note: 'Giá trị đã được người dùng chỉnh sửa và đang chờ xác nhận.',
                },
              ],
            };
          });

          if (!changed) return current;
          return {
            ...current,
            brand: {
              ...current.brand,
              name: getFactValue(facts, 'fact-brand-name', current.brand.name),
              tagline: getFactValue(facts, 'fact-tagline', current.brand.tagline),
              facts,
              readiness: calculateReadiness(facts, current.channels),
            },
          };
        },
        'Chỉnh sửa dữ kiện',
        `Đã cập nhật fact ${factId}; trạng thái chuyển về chờ xác nhận.`,
      );
    },
    [commit],
  );

  const confirmFact = useCallback(
    (factId: string): void => {
      commit(
        (current) => {
          let changed = false;
          const now = new Date().toISOString();
          const facts = current.brand.facts.map((fact) => {
            if (fact.id !== factId || fact.status === 'confirmed') return fact;
            changed = true;

            return {
              ...fact,
              status: 'confirmed' as const,
              updatedAt: now,
              confirmedAt: now,
              provenance: [
                ...fact.provenance,
                {
                  id: `prov-confirm-${fact.id}-${Date.now()}`,
                  sourceType: 'user' as const,
                  label: 'Xác nhận trong workspace',
                  url: null,
                  observedAt: now,
                  note: 'Người dùng đã xác nhận giá trị hiện tại.',
                },
              ],
            };
          });

          if (!changed) return current;
          return {
            ...current,
            brand: {
              ...current.brand,
              name: getFactValue(facts, 'fact-brand-name', current.brand.name),
              tagline: getFactValue(facts, 'fact-tagline', current.brand.tagline),
              facts,
              readiness: calculateReadiness(facts, current.channels),
            },
          };
        },
        'Xác nhận dữ kiện',
        `Đã xác nhận fact ${factId}.`,
      );
    },
    [commit],
  );

  const updateChannel = useCallback(
    (channelId: string, patch: ChannelProfilePatch): void => {
      commit(
        (current) => {
          const existingChannel = current.channels.find(
            (channel) => channel.id === channelId,
          );
          if (!existingChannel) return current;

          const updatedChannel: ChannelProfile = {
            ...existingChannel,
            ...patch,
            dataQuality: 'user_provided',
            status: 'needs_review',
            confirmedAt: null,
          };
          const channels = current.channels.map((channel) =>
            channel.id === channelId ? updatedChannel : channel
          );
          const sources = updateSourcesForChannel(
            current.sources,
            updatedChannel,
          );
          const studioSources = updateSourcesForChannel(
            current.studio.sources,
            updatedChannel,
          );
          const channelRules = current.studio.channelRules.map((rule) =>
            rule.channelId === updatedChannel.id
              ? {
                ...rule,
                role: updatedChannel.role,
                tone: updatedChannel.tone,
                cadence: updatedChannel.cadence,
                contentPillars: updatedChannel.contentPillars,
              }
              : rule
          );

          return {
            ...current,
            channels,
            sources,
            brand: {
              ...current.brand,
              readiness: calculateReadiness(current.brand.facts, channels),
            },
            studio: {
              ...current.studio,
              sources: studioSources,
              channelRules,
            },
          };
        },
        'Chỉnh sửa hồ sơ kênh',
        `Đã cập nhật channel ${channelId}; trạng thái chuyển về chờ xác nhận.`,
      );
    },
    [commit],
  );

  const confirmChannel = useCallback(
    (channelId: string): void => {
      commit(
        (current) => {
          let changed = false;
          const now = new Date().toISOString();
          const channels = current.channels.map((channel) => {
            if (channel.id !== channelId || channel.status === 'confirmed') {
              return channel;
            }

            changed = true;
            return {
              ...channel,
              status: 'confirmed' as const,
              confirmedAt: now,
            };
          });

          if (!changed) return current;
          return {
            ...current,
            channels,
            brand: {
              ...current.brand,
              readiness: calculateReadiness(current.brand.facts, channels),
            },
          };
        },
        'Xác nhận hồ sơ kênh',
        `Đã xác nhận channel ${channelId}.`,
      );
    },
    [commit],
  );

  const updateSatellite = useCallback(
    (
      satelliteId: string,
      patch: SatelliteRecommendationPatch,
    ): void => {
      commit(
        (current) => {
          let changed = false;
          const satellites = current.satellites.map((satellite) => {
            if (satellite.id !== satelliteId) return satellite;
            changed = true;

            const nextStatus = patch.status
              ?? (patch.profile
                  && (satellite.status === 'accepted' || satellite.status === 'active')
                ? 'suggested'
                : satellite.status);

            return {
              ...satellite,
              ...patch,
              status: nextStatus,
              profile: {
                ...satellite.profile,
                ...patch.profile,
              },
              confirmedAt: nextStatus === 'accepted' || nextStatus === 'active'
                ? new Date().toISOString()
                : null,
            };
          });

          return changed ? { ...current, satellites } : current;
        },
        'Chỉnh sửa kênh vệ tinh',
        `Đã cập nhật đề xuất ${satelliteId}.`,
      );
    },
    [commit],
  );

  const confirmSatellite = useCallback(
    (satelliteId: string): void => {
      commit(
        (current) => {
          let changed = false;
          const now = new Date().toISOString();
          const satellites = current.satellites.map((satellite) => {
            if (
              satellite.id !== satelliteId
              || satellite.status === 'accepted'
              || satellite.status === 'active'
              || satellite.status === 'dismissed'
            ) {
              return satellite;
            }

            changed = true;
            return {
              ...satellite,
              status: 'accepted' as const,
              confirmedAt: now,
            };
          });

          return changed ? { ...current, satellites } : current;
        },
        'Duyệt kênh vệ tinh',
        `Đã chuyển đề xuất ${satelliteId} sang trạng thái accepted.`,
      );
    },
    [commit],
  );

  const updateStrategy = useCallback(
    (patch: NinetyDayStrategyPatch): void => {
      commit(
        (current) => {
          if (Object.keys(patch).length === 0) return current;

          const now = new Date().toISOString();
          return {
            ...current,
            strategy: {
              ...current.strategy,
              ...patch,
              status: 'needs_review',
              updatedAt: now,
              confirmedAt: null,
              provenance: [
                ...current.strategy.provenance,
                {
                  id: `prov-strategy-edit-${Date.now()}`,
                  sourceType: 'user',
                  label: 'Chỉnh sửa chiến lược trong workspace',
                  url: null,
                  observedAt: now,
                  note: 'Kế hoạch đã được chỉnh sửa và chuyển về trạng thái chờ xác nhận.',
                },
              ],
            },
          };
        },
        'Chỉnh sửa chiến lược',
        `Đã cập nhật các trường: ${
          Object.keys(patch).join(', ') || 'không có'
        }; chiến lược chuyển về chờ xác nhận.`,
      );
    },
    [commit],
  );

  const confirmStrategy = useCallback((): void => {
    commit(
      (current) => {
        if (current.strategy.status === 'confirmed') return current;

        const now = new Date().toISOString();
        return {
          ...current,
          strategy: {
            ...current.strategy,
            status: 'confirmed',
            updatedAt: now,
            confirmedAt: now,
            provenance: [
              ...current.strategy.provenance,
              {
                id: `prov-strategy-confirm-${Date.now()}`,
                sourceType: 'user',
                label: 'Xác nhận chiến lược trong workspace',
                url: null,
                observedAt: now,
                note: 'Người dùng đã xác nhận phiên bản kế hoạch hiện tại.',
              },
            ],
          },
        };
      },
      'Xác nhận chiến lược',
      'Đã xác nhận phiên bản kế hoạch 90 ngày hiện tại.',
    );
  }, [commit]);

  const updateStudioConfig = useCallback(
    (patch: StudioConfigPatch): void => {
      const persisted = commit(
        (current) => {
          const studio = { ...current.studio, ...patch };
          return {
            ...current,
            sources: patch.sources ?? current.sources,
            workspace: {
              ...current.workspace,
              name: patch.workspaceName ?? current.workspace.name,
              industry: patch.industry ?? current.workspace.industry,
              timezone: patch.timezone ?? current.workspace.timezone,
            },
            brand: {
              ...current.brand,
              name: patch.workspaceName ?? current.brand.name,
              voiceTraits: patch.brandVoice?.traits ?? current.brand.voiceTraits,
            },
            studio,
          };
        },
        'Cập nhật Studio config',
        `Đã cập nhật các nhóm: ${Object.keys(patch).join(', ') || 'không có'}.`,
      );

      if (!persisted) {
        throw new Error(
          'Cấu hình đã cập nhật trong phiên hiện tại nhưng trình duyệt không thể lưu bản cục bộ.',
        );
      }
    },
    [commit],
  );

  return {
    data,
    status,
    error,
    reload,
    updateFact,
    confirmFact,
    updateChannel,
    confirmChannel,
    updateSatellite,
    confirmSatellite,
    updateStrategy,
    confirmStrategy,
    updateStudioConfig,
  };
}
