import {
	FILTER_BUILDER_PRESETS,
	type FilterBuilderConfig,
} from '@sgod-mongodb/library/infrastructure';

/** Mesh payment: `enterprise_id` + soft-delete `deleted_at`. */
export const PAYMENT_SOFT_DELETE_FILTER_CONFIG: FilterBuilderConfig =
	FILTER_BUILDER_PRESETS.enterpriseSnakeCaseDeletedAt;

/** Soft-delete `deleted_at` không có tenant (payment-provider — config global). */
export const PAYMENT_SOFT_DELETE_ONLY_FILTER_CONFIG: FilterBuilderConfig = {
	softDeleteMode: 'timestamp-exists',
	softDeleteField: 'deleted_at',
	injectSoftDelete: true,
};

/** Collection không có `deleted_at` — chỉ inject tenant `enterprise_id` khi có scope. */
export const PAYMENT_TENANT_FILTER_CONFIG: FilterBuilderConfig = {
	...FILTER_BUILDER_PRESETS.enterpriseSnakeCaseDeletedAt,
	injectSoftDelete: false,
};

/** Không tenant / không soft-delete (audit, outbox). */
export const PAYMENT_UNSCOPED_FILTER_CONFIG: FilterBuilderConfig = {
	injectSoftDelete: false,
};
