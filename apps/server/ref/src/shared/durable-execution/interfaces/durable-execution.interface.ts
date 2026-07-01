/**
 * Durable Execution Client Interface
 *
 * Provider-agnostic interface for executing workflows.
 */

/**
 * Options for workflow execution
 */
export interface WorkflowExecutionOptions {
	/**
	 * Unique identifier for this workflow execution
	 * If not provided, a random ID will be generated
	 */
	workflowId?: string;

	/**
	 * Task queue name
	 * @default 'default'
	 */
	taskQueue?: string;

	/**
	 * Workflow execution timeout in milliseconds
	 */
	timeout?: number;

	/**
	 * Additional metadata for the workflow execution
	 */
	metadata?: Record<string, string>;
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult<TOutput = unknown> {
	/**
	 * Workflow execution ID
	 */
	workflowId: string;

	/**
	 * Run ID (unique per execution attempt)
	 */
	runId: string;

	/**
	 * Workflow output
	 */
	output: TOutput;
}

/**
 * Durable execution client for starting and querying workflows
 */
export interface IDurableExecutionClient {
	/**
	 * Execute a workflow by its token
	 * @param workflowToken - Symbol token identifying the workflow
	 * @param input - Input data for the workflow
	 * @param options - Execution options
	 * @returns Workflow execution result
	 */
	execute<TOutput>(
		workflowToken: symbol,
		input: unknown,
		options?: WorkflowExecutionOptions
	): Promise<WorkflowExecutionResult<TOutput>>;

	/**
	 * Start a workflow by its token asynchronously without waiting for the result (fire-and-forget)
	 * @param workflowToken - Symbol token identifying the workflow
	 * @param input - Input data for the workflow
	 * @param options - Execution options
	 * @returns Workflow identifier and run identifier
	 */
	start(
		workflowToken: symbol,
		input: unknown,
		options?: WorkflowExecutionOptions
	): Promise<{ workflowId: string; runId: string }>;

	/**
	 * Get the result of a workflow execution
	 * @param workflowId - Workflow execution ID
	 * @returns Workflow execution result
	 */
	getResult<TOutput = unknown>(workflowId: string): Promise<WorkflowExecutionResult<TOutput>>;

	/**
	 * Cancel a running workflow
	 * @param workflowId - Workflow execution ID
	 */
	cancel(workflowId: string): Promise<void>;
}

/**
 * Injection token for IDurableExecutionClient
 */
export const DURABLE_EXECUTION_CLIENT = Symbol('DURABLE_EXECUTION_CLIENT');
