/**
 * Activity Validation Decorator
 *
 * Validates activity inputs and outputs using Zod schemas at runtime.
 * Prevents data corruption in distributed workflow execution.
 *
 * @example
 * ```typescript
 * const CreatePaymentInputSchema = z.object({
 *   amount: z.number().positive(),
 *   currency: z.string(),
 * });
 *
 * @Injectable()
 * @ActivityValidation({
 *   input: CreatePaymentInputSchema,
 *   output: CreatePaymentOutputSchema,
 * })
 * export class CreatePaymentActivity {
 *   async execute(input: CreatePaymentInput): Promise<CreatePaymentOutput> {
 *     // Input is already validated
 *     // Output will be validated before returning
 *   }
 * }
 * ```
 */

import 'reflect-metadata';
import { z } from 'zod';
import { Logger } from '@nestjs/common';
import { toError } from '@/shared/utils/error.util';

/**
 * Validation options for activity
 */
export interface ActivityValidationOptions<TInput, TOutput> {
	/**
	 * Zod schema for input validation
	 */
	input: z.ZodType<TInput>;

	/**
	 * Zod schema for output validation
	 */
	output: z.ZodType<TOutput>;
}

/**
 * Metadata keys for reflection
 */
const ACTIVITY_INPUT_SCHEMA = 'activity:inputSchema';
const ACTIVITY_OUTPUT_SCHEMA = 'activity:outputSchema';
const ACTIVITY_NAME = 'activity:name';

/**
 * Activity Validation Decorator
 *
 * Wraps the execute method with runtime validation.
 *
 * @param options - Validation schemas for input and output
 */
export function ActivityValidation<TInput, TOutput>(
	options: ActivityValidationOptions<TInput, TOutput>
) {
	return function (target: object): void {
		const ctor = target as { name: string; prototype: Record<string, unknown> };
		const activityName = ctor.name;
		const logger = new Logger(`ActivityValidation:${activityName}`);

		// Store schemas in metadata for potential introspection
		Reflect.defineMetadata(ACTIVITY_INPUT_SCHEMA, options.input, target);
		Reflect.defineMetadata(ACTIVITY_OUTPUT_SCHEMA, options.output, target);
		Reflect.defineMetadata(ACTIVITY_NAME, activityName, target);

		// Wrap the execute method
		type ExecuteFn = (this: unknown, input: TInput) => Promise<TOutput>;
		const classPrototype = ctor.prototype as { execute?: ExecuteFn };
		const originalExecute = classPrototype.execute;

		if (!originalExecute) {
			throw new Error(
				`Activity ${activityName} must have an execute() method to use @ActivityValidation decorator`
			);
		}

		classPrototype.execute = async function (this: unknown, input: unknown): Promise<TOutput> {
			// Validate input
			try {
				const validatedInput = options.input.parse(input);

				// Execute original method with validated input
				const result: unknown = await originalExecute.call(this, validatedInput);

				// Validate output
				const validatedOutput = options.output.parse(result);

				return validatedOutput;
			} catch (error) {
				if (error instanceof z.ZodError) {
					// Check if it's input or output validation error
					const isInputError = error.issues.some((_e) => {
						// Try to parse input again to see if this error came from input validation
						try {
							options.input.parse(input);
							return false; // Input validation passed, so this is output error
						} catch {
							return true; // Input validation failed
						}
					});

					const phase = isInputError ? 'input' : 'output';
					logger.error(
						`Activity ${activityName} ${phase} validation failed`,
						error.issues
					);

					throw new Error(
						`Activity ${activityName} ${phase} validation failed: ${error.message}`,
						{ cause: error }
					);
				}

				// Re-throw non-validation errors
				throw toError(error);
			}
		};
	};
}

/**
 * Get activity metadata
 *
 * @param target - Activity class
 * @returns Activity metadata
 */
export function getActivityMetadata(target: object): {
	name: string;
	inputSchema: z.ZodType | undefined;
	outputSchema: z.ZodType | undefined;
} {
	return {
		name: Reflect.getMetadata(ACTIVITY_NAME, target) as string,
		inputSchema: Reflect.getMetadata(ACTIVITY_INPUT_SCHEMA, target) as z.ZodType | undefined,
		outputSchema: Reflect.getMetadata(ACTIVITY_OUTPUT_SCHEMA, target) as z.ZodType | undefined,
	};
}
