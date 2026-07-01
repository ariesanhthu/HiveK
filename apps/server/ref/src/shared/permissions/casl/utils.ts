import { permittedFieldsOf } from '@casl/ability/extra';
import type { AppAbility, CaslAction, CaslSubject } from '@sgod-casl/library';

type FilterableRecord = Record<string, unknown>;

function isFilterableRecord(value: unknown): value is FilterableRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pickFields(obj: FilterableRecord, keys: readonly string[]): FilterableRecord {
	const result: FilterableRecord = {};
	for (const key of keys) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			result[key] = obj[key];
		}
	}
	return result;
}

function filterRecordArray(items: readonly unknown[], fields: readonly string[]): unknown[] {
	return items.map((item) => (isFilterableRecord(item) ? pickFields(item, fields) : item));
}

/**
 * Filters an object or array of objects to include only the fields permitted by CASL.
 */
export function filterPermittedFields<T>(
	ability: AppAbility,
	action: CaslAction,
	subject: CaslSubject,
	data: T
): T {
	const fields = permittedFieldsOf(ability, action, subject, {
		fieldsFrom: (rule) => rule.fields ?? [],
	});

	if (!fields || fields.length === 0 || fields.includes('*')) {
		return data;
	}

	if (Array.isArray(data)) {
		return filterRecordArray(data, fields) as T;
	}

	if (isFilterableRecord(data)) {
		return pickFields(data, fields) as T;
	}

	return data;
}
