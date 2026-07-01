import type { QuotaProps } from '@/core';

/**
 * Maps persisted Mongo / JSON quota blobs into {@link QuotaProps}.
 */
export function quotaPropsFromUnknown(raw: unknown): QuotaProps {
	if (!raw || typeof raw !== 'object') {
		return {};
	}
	const out: QuotaProps = {};
	for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
		if (typeof v === 'number' && Number.isFinite(v)) {
			out[k] = v;
		}
	}
	return out;
}
