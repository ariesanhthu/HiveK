/**
 * Activity Token Decorator
 *
 * Provides type-safe activity naming using tokens.
 * Single source of truth for activity names defined in workflow files.
 *
 * **Benefits:**
 * - Compile-time safety: Renamed activities break the build
 * - Auto-completion: IDEs can suggest activity tokens
 * - Refactor-safe: Find all usages works across workflow definitions
 * - No magic strings: Token approach prevents typos
 *
 * @example
 * ```typescript
 * // Define tokens in workflow file
 * export const PAYMENT_ACTIVITIES = {
 *   VALIDATE: Symbol('validate-payment'),
 *   EXECUTE: Symbol('execute-payment'),
 *   PROCESS: Symbol('process-result'),
 * } as const;
 *
 * // Use decorator in activity class
 * @Injectable()
 * @Activity(PAYMENT_ACTIVITIES.VALIDATE)
 * export class ValidatePaymentActivity {
 *   async execute(input: ValidateInput): Promise<ValidateOutput> {
 *     // ...
 *   }
 * }
 *
 * // Use token in workflow definition
 * const workflow: WorkflowDefinition = {
 *   steps: [
 *     {
 *       name: 'validate',
 *       activity: getActivityToken(PAYMENT_ACTIVITIES.VALIDATE),
 *       // ...
 *     }
 *   ]
 * };
 * ```
 */

import 'reflect-metadata';

/**
 * Metadata key for activity token
 */
const ACTIVITY_TOKEN_KEY = 'activity:token';

/**
 * Activity decorator options
 */
export interface ActivityDecoratorOptions {
	/**
	 * Token symbol for this activity
	 */
	token: symbol;

	/**
	 * Optional human-readable name
	 * If not provided, uses Symbol description
	 */
	name?: string;
}

/**
 * Activity decorator
 * Registers a unique token for type-safe activity references
 *
 * @param tokenOrOptions - Symbol token or options object
 * @returns Class decorator
 *
 * @example
 * ```typescript
 * // Simple usage with symbol
 * @Activity(Symbol('charge-card'))
 * export class ChargeCardActivity {}
 *
 * // With options
 * @Activity({
 *   token: PAYMENT_ACTIVITIES.CHARGE,
 *   name: 'Charge Card Activity'
 * })
 * export class ChargeCardActivity {}
 * ```
 */
export function Activity(tokenOrOptions: symbol | ActivityDecoratorOptions): ClassDecorator {
	return (target: object): void => {
		// Normalize input
		const options: ActivityDecoratorOptions =
			typeof tokenOrOptions === 'symbol' ? { token: tokenOrOptions } : tokenOrOptions;

		// Store token in metadata
		Reflect.defineMetadata(ACTIVITY_TOKEN_KEY, options.token, target);

		// Store optional name
		if (options.name) {
			Reflect.defineMetadata('activity:name', options.name, target);
		}

		// Set default name from Symbol description if available
		if (!options.name && options.token.description) {
			Reflect.defineMetadata('activity:name', options.token.description, target);
		}
	};
}

/**
 * Get activity token from decorated class
 *
 * @param activityClass - Activity class or instance
 * @returns Activity token symbol
 * @throws Error if class is not decorated with @Activity
 *
 * @example
 * ```typescript
 * const token = getActivityToken(ChargeCardActivity);
 * // Use in workflow definition
 * const workflow = {
 *   steps: [
 *     {
 *       name: 'charge',
 *       activity: token,
 *       // ...
 *     }
 *   ]
 * };
 * ```
 */
export function getActivityToken(activityClass: unknown): symbol {
	const target =
		typeof activityClass === 'function'
			? activityClass
			: (activityClass as { constructor: object }).constructor;
	const tokenUnknown: unknown = Reflect.getMetadata(ACTIVITY_TOKEN_KEY, target);

	if (typeof tokenUnknown !== 'symbol') {
		const label =
			typeof target === 'function' && 'name' in target && typeof target.name === 'string'
				? target.name
				: typeof target === 'function'
					? 'anonymous'
					: 'object';
		throw new Error(
			`Activity token not found for ${label}. Did you forget to add @Activity() decorator?`
		);
	}

	return tokenUnknown;
}

/**
 * Get activity name from decorated class
 *
 * @param activityClass - Activity class or instance
 * @returns Activity name or undefined
 *
 * @example
 * ```typescript
 * const name = getActivityName(ChargeCardActivity);
 * console.log(name); // "charge-card" or custom name
 * ```
 */
export function getActivityName(activityClass: unknown): string | undefined {
	const target =
		typeof activityClass === 'function'
			? activityClass
			: (activityClass as { constructor: object }).constructor;
	const nameUnknown: unknown = Reflect.getMetadata('activity:name', target);
	return typeof nameUnknown === 'string' ? nameUnknown : undefined;
}

/**
 * Check if class has @Activity decorator
 *
 * @param activityClass - Activity class or instance
 * @returns true if decorated
 *
 * @example
 * ```typescript
 * if (hasActivityDecorator(SomeClass)) {
 *   const token = getActivityToken(SomeClass);
 * }
 * ```
 */
export function hasActivityDecorator(activityClass: unknown): boolean {
	const target =
		typeof activityClass === 'function'
			? activityClass
			: (activityClass as { constructor: object }).constructor;
	return Reflect.hasMetadata(ACTIVITY_TOKEN_KEY, target);
}

/**
 * ===============================================
 * ACTIVITY TOKEN BEST PRACTICES
 * ===============================================
 *
 * 1. **Define tokens in workflow files**
 *    Keep activity tokens close to where they're used
 *
 * 2. **Use descriptive Symbol descriptions**
 *    Symbol('validate-payment') not Symbol('v1')
 *
 * 3. **Group related activities**
 *    Export token constants from workflow modules
 *
 * 4. **One token per activity**
 *    Don't reuse tokens across different activities
 *
 * 5. **Consistent naming**
 *    Match token description to activity class name
 *
 * @example
 * ```typescript
 * // Good: Organized token definitions
 * // payment-workflows/tokens.ts
 * export const PAYMENT_ACTIVITIES = {
 *   VALIDATE: Symbol('validate-payment'),
 *   EXECUTE: Symbol('execute-payment'),
 *   PROCESS: Symbol('process-payment-result'),
 *   REFUND: Symbol('refund-payment'),
 * } as const;
 *
 * // Activities reference tokens
 * @Activity(PAYMENT_ACTIVITIES.VALIDATE)
 * export class ValidatePaymentActivity {}
 *
 * // Workflows use getActivityToken()
 * steps: [
 *   {
 *     name: 'validate',
 *     activity: getActivityToken(ValidatePaymentActivity),
 *   }
 * ]
 *
 * // Alternative: Use tokens directly (less type-safe)
 * steps: [
 *   {
 *     name: 'validate',
 *     activity: PAYMENT_ACTIVITIES.VALIDATE,
 *   }
 * ]
 * ```
 */

/**
 * ===============================================
 * MIGRATION FROM STRING NAMES
 * ===============================================
 *
 * If you have existing activities with string names:
 *
 * 1. Create token constants:
 * ```typescript
 * export const LEGACY_ACTIVITIES = {
 *   CHARGE: Symbol('chargeCard'), // Match old string name
 * };
 * ```
 *
 * 2. Add decorator to activity:
 * ```typescript
 * @Activity(LEGACY_ACTIVITIES.CHARGE)
 * export class ChargeCardActivity {}
 * ```
 *
 * 3. Update workflow definitions:
 * ```typescript
 * // Before
 * activity: 'chargeCard'
 *
 * // After
 * activity: getActivityToken(ChargeCardActivity)
 * // or
 * activity: LEGACY_ACTIVITIES.CHARGE
 * ```
 *
 * 4. Update infrastructure layer to handle both:
 * ```typescript
 * function resolveActivity(activityRef: string | symbol) {
 *   if (typeof activityRef === 'string') {
 *     // Legacy: lookup by string name
 *     return activityRegistry.getByName(activityRef);
 *   } else {
 *     // New: lookup by token
 *     return activityRegistry.getByToken(activityRef);
 *   }
 * }
 * ```
 */
