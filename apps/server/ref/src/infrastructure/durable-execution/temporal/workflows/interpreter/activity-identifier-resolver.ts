/**
 * Activity Identifier Resolver
 *
 * Resolves activity identifiers (string or symbol) to activity function names.
 * Handles both legacy string-based names and new symbol-based tokens.
 *
 * This is critical for maintaining backward compatibility while supporting
 * the new token-first approach from Phase 1.
 */

/**
 * Resolve activity identifier to string name
 *
 * Supports both string names (legacy) and symbol tokens (new approach).
 * For symbols, uses the Symbol.description as the activity name.
 *
 * @param activityRef - Activity identifier (string or symbol)
 * @returns String name for activity lookup
 * @throws Error if symbol has no description
 *
 * @example
 * ```typescript
 * // Legacy: string names
 * resolveActivityIdentifier('ValidatePaymentActivity')
 * // Returns: "ValidatePaymentActivity"
 *
 * // New: symbol tokens
 * const token = Symbol('ValidatePayment');
 * resolveActivityIdentifier(token)
 * // Returns: "ValidatePayment"
 *
 * // With @Activity decorator
 * @Activity(Symbol('ValidatePayment'))
 * class ValidatePaymentActivity {}
 *
 * const token = getActivityToken(ValidatePaymentActivity);
 * resolveActivityIdentifier(token)
 * // Returns: "ValidatePayment"
 * ```
 */
export function resolveActivityIdentifier(activityRef: string | symbol): string {
	// String-based name (legacy approach)
	if (typeof activityRef === 'string') {
		return activityRef;
	}

	// Symbol-based token (new approach)
	if (typeof activityRef === 'symbol') {
		const description = activityRef.description;

		if (!description) {
			throw new Error(
				'Activity symbol must have a description. Use Symbol("activityName") or @Activity decorator.'
			);
		}

		return description;
	}

	throw new Error(
		`Invalid activity identifier type: ${typeof activityRef}. Must be string or symbol.`
	);
}

/**
 * Validate activity identifier
 *
 * Checks if an activity identifier is valid (string or symbol with description)
 *
 * @param activityRef - Activity identifier to validate
 * @returns true if valid
 */
export function isValidActivityIdentifier(activityRef: unknown): activityRef is string | symbol {
	if (typeof activityRef === 'string' && activityRef.length > 0) {
		return true;
	}

	if (typeof activityRef === 'symbol' && activityRef.description) {
		return true;
	}

	return false;
}

/**
 * Resolve multiple activity identifiers
 *
 * Useful for resolving activity references in branches or compensation steps
 *
 * @param refs - Array of activity identifiers
 * @returns Array of resolved string names
 */
export function resolveActivityIdentifiers(refs: (string | symbol)[]): string[] {
	return refs.map(resolveActivityIdentifier);
}
