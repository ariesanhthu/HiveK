import type { SubscriptionChangeDetailsProps } from '@/core';
import { QuotaVO } from '@/core';
import type { JsonRecord } from '@/shared/types';
import { quotaPropsFromUnknown } from './quota-from-document';
import { SubscriptionChangeDetailsModel } from '../schemas/subscription-history.schema';

function stringArrayFromUnknown(value: unknown): string[] {
	return Array.isArray(value) && value.every((x): x is string => typeof x === 'string')
		? value
		: [];
}

/**
 * Maps persisted `details` (camelCase keys) from subscription history documents.
 */
export function subscriptionChangeDetailsPropsFromMongo(
	details: SubscriptionChangeDetailsModel | Record<string, unknown> | null | undefined
): SubscriptionChangeDetailsProps {
	const d = details ?? {};
	return {
		oldPackages: stringArrayFromUnknown(d.oldPackages),
		newPackages: stringArrayFromUnknown(d.newPackages),
		oldQuotas: new QuotaVO(quotaPropsFromUnknown(d.oldQuotas)),
		newQuotas: new QuotaVO(quotaPropsFromUnknown(d.newQuotas)),
		oldPermissions: stringArrayFromUnknown(d.oldPermissions),
		newPermissions: stringArrayFromUnknown(d.newPermissions),
	};
}
