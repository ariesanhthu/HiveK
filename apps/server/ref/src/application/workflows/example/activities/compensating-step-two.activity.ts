import { Inject, Injectable } from '@nestjs/common';
import { z } from 'zod';
import { Activity, ActivityValidation } from '@/shared/durable-execution';
import { type ILoggerService, LOGGER_SERVICE } from '@/core';
import { COMPENSATE_STEP_TWO } from '../example.token';

// Input/Output schemas
const CompensatingStepTwoInputSchema = z.object({
	data: z.string(),
});

const CompensatingStepTwoOutputSchema = z.object({
	resultCompensatingStepTwo: z.string(),
});

export type CompensatingStepTwoInput = z.infer<typeof CompensatingStepTwoInputSchema>;
export type CompensatingStepTwoOutput = z.infer<typeof CompensatingStepTwoOutputSchema>;

@Injectable()
@Activity(COMPENSATE_STEP_TWO)
@ActivityValidation({
	input: CompensatingStepTwoInputSchema,
	output: CompensatingStepTwoOutputSchema,
})
export class CompensatingStepTwoActivity {
	constructor(@Inject(LOGGER_SERVICE) private readonly logger: ILoggerService) {
		this.logger.setContext('CompensatingStepTwoActivity');
	}

	async execute(input: CompensatingStepTwoInput): Promise<CompensatingStepTwoOutput> {
		this.logger.log(`Executing step two with input: ${JSON.stringify(input)}`);
		return {
			resultCompensatingStepTwo: `Result of step two for input: ${input.data}`,
		};
	}
}
