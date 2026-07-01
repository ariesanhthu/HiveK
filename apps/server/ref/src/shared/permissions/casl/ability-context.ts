import { getCurrentAbility, type AppAbility } from '@sgod-casl/library/core';

/** Đọc ability từ ALS — wrapper typed cho interceptor/handler payment-service. */
export function readCurrentAbility(): AppAbility | undefined {
	return getCurrentAbility();
}
