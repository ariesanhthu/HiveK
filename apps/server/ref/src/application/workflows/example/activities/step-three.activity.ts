import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { STEP_THREE } from '../example.token';
import { type ILoggerService, LOGGER_SERVICE } from '@/core';

// Input/Output schemas
const StepThreeInputSchema = z.object({
	data: z.string(),
	errorStep: z.number().optional(),
});

const StepThreeOutputSchema = z.object({
	resultStepThree: z.string(),
});

export type StepThreeInput = z.infer<typeof StepThreeInputSchema>;
export type StepThreeOutput = z.infer<typeof StepThreeOutputSchema>;

@Injectable()
@Activity(STEP_THREE)
@ActivityValidation({
	input: StepThreeInputSchema,
	output: StepThreeOutputSchema,
})
export class StepThreeActivity {
	constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
		this.logger.setContext('StepThreeActivity');
	}

	async execute(input: StepThreeInput): Promise<StepThreeOutput> {
		this.logger.log(`Executing step three with input: ${JSON.stringify(input)}`);
		if (input.errorStep === 3) {
			throw new Error('Error in step three');
		}
		return {
			resultStepThree: `Result of step three for input: ${input.data}`,
		};
	}
}
