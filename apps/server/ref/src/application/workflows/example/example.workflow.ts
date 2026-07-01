/**
 * Payment Cancel Workflow Definition
 *
 * Cancels a pending payment.
 * Multi-step workflow with validation, provider notification, and state update.
 *
 * Steps:
 * 1. validate - Pre-flight checks (can cancel, not terminal, not processing)
 * 2. cancelAtProvider - Notify gateway (empty for now, future-proof)
 * 3. cancelPayment - Update state and publish events inside transaction
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	EXAMPLE_WORKFLOW,
	STEP_ONE,
	STEP_TWO,
	STEP_THREE,
	COMPENSATE_STEP_ONE,
	COMPENSATE_STEP_TWO,
} from './example.token';

// Input/Output types
export interface ExampleWorkflowInput {
	data: string;
	errorStep?: number;
}

export interface ExampleWorkflowOutput {
	resultStepOne: string;
	resultStepTwo: string;
	resultStepThree: string;
	finalResult: string;
}

// Context type (accumulates step outputs)
interface ExampleContext {
	input: ExampleWorkflowInput;
	stepOne: {
		resultStepOne: string;
	};
	stepTwo: {
		resultStepTwo: string;
	};
	stepThree: {
		resultStepThree: string;
	};
}

// Workflow definition
export const exampleWorkflowDefinition: WorkflowDefinition<
	ExampleWorkflowInput,
	ExampleWorkflowOutput,
	ExampleContext
> = {
	token: EXAMPLE_WORKFLOW,
	name: 'example',

	steps: [
		{
			name: 'stepOne',
			activity: STEP_ONE,
			input: (ctx) => ({
				data: ctx.input.data,
				errorStep: ctx.input.errorStep,
			}),
			outputKey: 'stepOne',
			compensation: {
				activity: COMPENSATE_STEP_ONE,
				input: (ctx) => ({
					data: ctx.stepOne?.resultStepOne,
				}),
				activityOptions: {
					timeout: 30000, // 30 seconds timeout
					retryPolicy: {
						maxAttempts: 1,
					},
				},
			},
		},
		{
			name: 'stepTwo',
			activity: STEP_TWO,
			when: (ctx) => ctx.stepOne && !ctx.stepTwo,
			input: (ctx) => ({
				data: ctx.input.data,
				errorStep: ctx.input.errorStep,
			}),
			outputKey: 'stepTwo',
			activityOptions: {
				timeout: 30000, // 30 seconds timeout
				retryPolicy: {
					maxAttempts: 2,
				},
			},
			compensation: {
				activity: COMPENSATE_STEP_TWO,
				input: (ctx) => ({
					data: ctx.stepTwo?.resultStepTwo,
					errorStep: ctx.input.errorStep,
				}),
				activityOptions: {
					timeout: 30000, // 30 seconds timeout
					retryPolicy: {
						maxAttempts: 1,
					},
				},
			},
		},
		{
			name: 'stepThree',
			activity: STEP_THREE,
			input: (ctx) => ({
				data: ctx.input.data,
			}),
			outputKey: 'stepThree',
		},
	],

	output: (ctx) => ({
		resultStepOne: ctx.stepOne?.resultStepOne || '',
		resultStepTwo: ctx.stepTwo?.resultStepTwo || '',
		resultStepThree: ctx.stepThree?.resultStepThree || '',
		finalResult: `Final Result: ${ctx.stepOne?.resultStepOne}, ${ctx.stepTwo?.resultStepTwo}, ${ctx.stepThree?.resultStepThree}`,
	}),

	defaultActivityOptions: {
		retryPolicy: {
			maxAttempts: 1,
			initialInterval: 1000,
			maxInterval: 10000,
			backoffCoefficient: 2,
		},
	},
};
