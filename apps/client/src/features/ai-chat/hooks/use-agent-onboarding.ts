'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  advanceInitializationStep,
  applyBusinessDetails,
  applyConnections,
  beginDiscovery,
  beginInitialization,
  clearAgentOnboardingState,
  completeInitialization,
  createInitialOnboardingState,
  failDiscovery,
  loadAgentOnboardingState,
  logOnboardingActivity,
  prepareDiscovery,
  resolveDiscovery,
  saveAgentOnboardingState,
} from '../services/onboarding-state-service';
import type {
  AdvanceInitializationInput,
  AgentOnboardingState,
  BusinessDetailsInput,
  CompleteDiscoveryInput,
  DiscoveryFailureInput,
  OnboardingConnectionChoice,
  OnboardingExecutionMode,
  OnboardingStorageStatus,
  UseAgentOnboardingResult,
} from '../types/onboarding-types';

type StateTransition = (current: AgentOnboardingState) => AgentOnboardingState;

export function useAgentOnboarding(): UseAgentOnboardingResult {
  const [state, setState] = useState<AgentOnboardingState>(() => createInitialOnboardingState());
  const [isHydrated, setIsHydrated] = useState(false);
  const [storageStatus, setStorageStatus] = useState<OnboardingStorageStatus>('loading');
  const stateRef = useRef(state);

  useEffect(() => {
    const loaded = loadAgentOnboardingState();
    stateRef.current = loaded.state;
    setState(loaded.state);
    setStorageStatus(loaded.storageAvailable ? 'ready' : 'unavailable');
    setIsHydrated(true);
  }, []);

  const commit = useCallback(
    (
      transition: StateTransition,
      action: string,
      detail?: Record<string, unknown>,
    ): AgentOnboardingState => {
      const current = stateRef.current;
      const next = transition(current);

      if (next === current) {
        logOnboardingActivity(`${action}: bỏ qua`, {
          stage: current.stage,
          ...detail,
        });
        return current;
      }

      stateRef.current = next;
      setState(next);
      const saved = saveAgentOnboardingState(next);
      setStorageStatus(saved ? 'saved' : 'unavailable');
      logOnboardingActivity(action, {
        from: current.stage,
        to: next.stage,
        ...detail,
      });
      return next;
    },
    [],
  );

  const startDiscovery = useCallback(
    (query?: string): void => {
      commit(
        (current) => prepareDiscovery(current, query),
        'Bắt đầu tìm nguồn',
        { hasQuery: Boolean(query?.trim()) },
      );
    },
    [commit],
  );

  const selectExecutionMode = useCallback(
    (mode: OnboardingExecutionMode): void => {
      commit(
        (current) => beginDiscovery(current, mode),
        'Chọn chế độ thiết lập',
        { mode },
      );
    },
    [commit],
  );

  const reportDiscoveryFailure = useCallback(
    (input: DiscoveryFailureInput | string): void => {
      const failureInput = typeof input === 'string' ? { reason: input } : input;
      commit(
        (current) => failDiscovery(current, failureInput),
        'Không thể hoàn tất tìm nguồn',
        {
          retainedSources: failureInput.sources?.length
            ?? stateRef.current.discovery.sources.length,
        },
      );
    },
    [commit],
  );

  const completeDiscovery = useCallback(
    (input: CompleteDiscoveryInput): void => {
      commit(
        (current) => resolveDiscovery(current, input),
        'Hoàn tất tìm nguồn',
        { sourceCount: input.sources.length, result: input.result ?? 'auto' },
      );
    },
    [commit],
  );

  const saveConnections = useCallback(
    (choices: OnboardingConnectionChoice[]): void => {
      commit(
        (current) => applyConnections(current, choices),
        'Lưu lựa chọn kết nối',
        { sourceCount: choices.length },
      );
    },
    [commit],
  );

  const saveDetails = useCallback(
    (details: BusinessDetailsInput): void => {
      commit(
        (current) => applyBusinessDetails(current, details),
        'Lưu thông tin doanh nghiệp',
        { fields: Object.keys(details) },
      );
    },
    [commit],
  );

  const startInitialization = useCallback((): void => {
    commit(
      (current) => beginInitialization(current),
      'Bắt đầu khởi tạo hồ sơ',
    );
  }, [commit]);

  const advanceInitialization = useCallback(
    (input: AdvanceInitializationInput = {}): void => {
      commit(
        (current) => advanceInitializationStep(current, input),
        'Cập nhật bước khởi tạo',
        {
          stepId: input.stepId ?? 'active',
          outcome: input.outcome ?? 'complete',
        },
      );
    },
    [commit],
  );

  const finishInitialization = useCallback((): boolean => {
    const current = stateRef.current;
    if (current.stage === 'ready') return true;

    const next = commit(
      (value) => completeInitialization(value),
      'Hoàn tất khởi tạo hồ sơ',
    );
    return next.stage === 'ready';
  }, [commit]);

  const reset = useCallback((): void => {
    const next = createInitialOnboardingState();
    stateRef.current = next;
    setState(next);
    const cleared = clearAgentOnboardingState();
    setStorageStatus(cleared ? 'ready' : 'unavailable');
    logOnboardingActivity('Đặt lại tiến trình', { cleared });
  }, []);

  return {
    state,
    isHydrated,
    storageStatus,
    startDiscovery,
    selectExecutionMode,
    reportDiscoveryFailure,
    completeDiscovery,
    saveConnections,
    saveDetails,
    startInitialization,
    advanceInitialization,
    finishInitialization,
    reset,
  };
}
