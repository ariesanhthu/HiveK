import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { STEP_TWO } from '../example.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core';

// Input/Output schemas
const StepTwoInputSchema = z.object({
	data: z.string(),
	errorStep: z.number().optional(),
});

const StepTwoOutputSchema = z.object({
	resultStepTwo: z.string(),
});

export type StepTwoInput = z.infer<typeof StepTwoInputSchema>;
export type StepTwoOutput = z.infer<typeof StepTwoOutputSchema>;

@Injectable()
@Activity(STEP_TWO)
@ActivityValidation({
	input: StepTwoInputSchema,
	output: StepTwoOutputSchema,
})
export class StepTwoActivity {
	constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
		this.logger.setContext('StepTwoActivity');
	}

	async execute(input: StepTwoInput): Promise<StepTwoOutput> {
		this.logger.log(`Executing step two with input: ${JSON.stringify(input)}`);
		if (input.errorStep === 2) {
			throw new Error('Error in step two');
		}
		return {
			resultStepTwo: `Result of step two for input: ${input.data}`,
		};
	}
}
