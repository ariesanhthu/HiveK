import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { STEP_ONE } from '../example.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core';

// Input/Output schemas
const StepOneInputSchema = z.object({
	data: z.string(),
	errorStep: z.number().optional(),
});

const StepOneOutputSchema = z.object({
	resultStepOne: z.string(),
});

export type StepOneInput = z.infer<typeof StepOneInputSchema>;
export type StepOneOutput = z.infer<typeof StepOneOutputSchema>;

@Injectable()
@Activity(STEP_ONE)
@ActivityValidation({
	input: StepOneInputSchema,
	output: StepOneOutputSchema,
})
export class StepOneActivity {
	constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
		this.logger.setContext('StepOneActivity');
	}

	async execute(input: StepOneInput): Promise<StepOneOutput> {
		this.logger.log(`Executing step one with input: ${JSON.stringify(input)}`);
		if (input.errorStep === 1) {
			throw new Error('Error in step one');
		}
		return {
			resultStepOne: `Result of step one for input: ${input.data}`,
		};
	}
}
