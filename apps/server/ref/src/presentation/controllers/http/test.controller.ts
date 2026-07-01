import { Controller, Inject, Get, Query } from '@nestjs/common';
import { DURABLE_EXECUTION_CLIENT, type IDurableExecutionClient } from '@/shared/durable-execution';
import { EXAMPLE_WORKFLOW } from '@/application/workflows/example/example.token';
import { ExampleWorkflowOutput } from '@/application/workflows/example/example.workflow';
import { uuid4 } from '@temporalio/workflow';

@Controller('test')
export class TestController {
	constructor(
		@Inject(DURABLE_EXECUTION_CLIENT)
		private readonly executor: IDurableExecutionClient
	) {}

	@Get()
	async testWorkflow(@Query('error_step') errorStep?: number) {
		const error = errorStep;
		const result = await this.executor.execute<ExampleWorkflowOutput>(
			EXAMPLE_WORKFLOW,
			{
				data: 'EXAMPLE WORKFLOW',
				errorStep: error,
			},
			{ workflowId: uuid4() }
		);
		console.log(result);
		return result;
	}
}
