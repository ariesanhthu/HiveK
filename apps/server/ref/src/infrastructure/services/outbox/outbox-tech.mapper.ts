import { Inject, Injectable } from '@nestjs/common';
import { WORKFLOW_FACTORY, type IWorkflowFactory } from '@/core';

export enum EOutboxProcessorTech {
	TEMPORAL_WORKFLOW = 'TEMPORAL_WORKFLOW',
	KAFKA_EVENT = 'KAFKA_EVENT',
}

@Injectable()
export class OutboxEventTechMapper {
	constructor(
		@Inject(WORKFLOW_FACTORY)
		private readonly workflowFactory: IWorkflowFactory
	) {}

	public getProcessorTech(eventType: string): EOutboxProcessorTech {
		// If a workflow token is mapped to this event type, route it to Temporal
		if (this.workflowFactory.getWorkflowToken(eventType)) {
			return EOutboxProcessorTech.TEMPORAL_WORKFLOW;
		}
		// Otherwise, default to Kafka integration events
		return EOutboxProcessorTech.KAFKA_EVENT;
	}
}
