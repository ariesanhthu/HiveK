/**
 * Temporal Durable Execution Client
 *
 * Implements IDurableExecutionClient interface using Temporal.
 * Maps application workflow tokens to Temporal workflows and executes them.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { Client } from '@temporalio/client';
import {
	IDurableExecutionClient,
	WorkflowExecutionOptions,
	WorkflowExecutionResult,
} from '@/shared/durable-execution';
import { getWorkflowName, isWorkflowRegistered } from './registry/workflow.registry';
import { TEMPORAL_CONFIG } from './config';

export const TEMPORAL_CLIENT_TOKEN = Symbol('TEMPORAL_CLIENT');

@Injectable()
export class TemporalDurableExecutionClient implements IDurableExecutionClient {
	private readonly logger = new Logger(TemporalDurableExecutionClient.name);

	constructor(
		@Inject(TEMPORAL_CLIENT_TOKEN)
		private readonly client: Client
	) {}

	/**
	 * Execute a workflow and wait for the result
	 */
	async execute<TOutput>(
		workflowToken: symbol,
		input: unknown,
		options?: WorkflowExecutionOptions
	): Promise<WorkflowExecutionResult<TOutput>> {
		const workflowName = this.resolveWorkflowName(workflowToken);
		const workflowId = options?.workflowId || this.generateWorkflowId(workflowName);

		this.logger.log(`Executing workflow ${workflowName} with ID ${workflowId}`);

		const handle = await this.client.workflow.start(workflowName, {
			taskQueue: TEMPORAL_CONFIG.taskQueue,
			workflowId,
			args: [input],
			workflowExecutionTimeout: options?.timeout,
		});

		const output: unknown = await handle.result();

		// Get run ID from describe() since firstExecutionRunId doesn't exist
		const description = await handle.describe();

		return {
			workflowId: handle.workflowId,
			runId: description.runId,
			output: output as TOutput,
		};
	}

	/**
	 * Start a workflow asynchronously (fire-and-forget)
	 */
	async start(
		workflowToken: symbol,
		input: unknown,
		options?: WorkflowExecutionOptions
	): Promise<{ workflowId: string; runId: string }> {
		const workflowName = this.resolveWorkflowName(workflowToken);
		const workflowId = options?.workflowId || this.generateWorkflowId(workflowName);

		this.logger.log(`Starting workflow ${workflowName} asynchronously with ID ${workflowId}`);

		const handle = await this.client.workflow.start(workflowName, {
			taskQueue: TEMPORAL_CONFIG.taskQueue,
			workflowId,
			args: [input],
			workflowExecutionTimeout: options?.timeout,
		});

		const description = await handle.describe();

		return {
			workflowId: handle.workflowId,
			runId: description.runId,
		};
	}

	/**
	 * Get the result of a workflow execution
	 */
	async getResult<TOutput = unknown>(
		workflowId: string
	): Promise<WorkflowExecutionResult<TOutput>> {
		const handle = this.client.workflow.getHandle(workflowId);
		const output: unknown = await handle.result();
		const description = await handle.describe();

		return {
			workflowId: handle.workflowId,
			runId: description.runId,
			output: output as TOutput,
		};
	}

	/**
	 * Cancel a running workflow
	 */
	async cancel(workflowId: string): Promise<void> {
		const handle = this.client.workflow.getHandle(workflowId);
		await handle.cancel();
	}

	/**
	 * Resolve workflow token to Temporal workflow function name
	 */
	private resolveWorkflowName(token: symbol): string {
		if (!isWorkflowRegistered(token)) {
			throw new Error(`Workflow not registered: ${token.toString()}`);
		}

		const workflowName = getWorkflowName(token);
		if (!workflowName) {
			throw new Error(`Workflow name not found for token: ${token.toString()}`);
		}

		return workflowName;
	}

	/**
	 * Generate a unique workflow ID
	 */
	private generateWorkflowId(workflowName: string): string {
		return `${workflowName}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
	}
}
