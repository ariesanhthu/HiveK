/**
 * Activity Interface
 *
 * Base interface for all durable execution activities.
 */

/**
 * Base activity interface
 */
export interface IActivity<TInput = unknown, TOutput = unknown> {
	/**
	 * Execute the activity with the given input
	 * @param input - Activity input data
	 * @returns Activity output data
	 */
	execute(input: TInput): Promise<TOutput>;
}

/**
 * Activity metadata stored via reflection
 */
export interface ActivityMetadata {
	/**
	 * Activity name (usually class name)
	 */
	name: string;

	/**
	 * Input schema for validation
	 */
	inputSchema?: unknown; // Will be ZodSchema

	/**
	 * Output schema for validation
	 */
	outputSchema?: unknown; // Will be ZodSchema
}
