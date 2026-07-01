import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { type ILoggerService, LOGGER_SERVICE } from '@/core';
import { COMPENSATE_STEP_ONE } from '../example.token';

// Input/Output schemas
const CompensatingStepOneInputSchema = z.object({
	data: z.string(),
});

const CompensatingStepOneOutputSchema = z.object({
	resultCompensatingStepOne: z.string(),
});

export type CompensatingStepOneInput = z.infer<typeof CompensatingStepOneInputSchema>;
export type CompensatingStepOneOutput = z.infer<typeof CompensatingStepOneOutputSchema>;

@Injectable()
@Activity(COMPENSATE_STEP_ONE)
@ActivityValidation({
	input: CompensatingStepOneInputSchema,
	output: CompensatingStepOneOutputSchema,
})
export class CompensatingStepOneActivity {
	constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
		this.logger.setContext('CompensatingStepOneActivity');
	}

	async execute(input: CompensatingStepOneInput): Promise<CompensatingStepOneOutput> {
		this.logger.log(`Executing step one with input: ${JSON.stringify(input)}`);
		return {
			resultCompensatingStepOne: `Result of step one for input: ${input.data}`,
		};
	}
}
