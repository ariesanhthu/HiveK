import { Inject, Injectable } from '@nestjs/common';
import {
	EVENT_BUS,
	type IEventBus,
	OutboxEntity,
} from '@/core';
import { DURABLE_EXECUTION_CLIENT, type IDurableExecutionClient } from '@/shared/durable-execution';
import { WORKFLOW_FACTORY, type IWorkflowFactory } from '@/core';
import { EOutboxProcessorTech } from './outbox-tech.mapper';
import { CapturePaymentRequestPayload, UpdateSubscriptionPayload } from '@/application/events';

export interface IOutboxEventProcessor {
	process(event: OutboxEntity): Promise<void>;
}

@Injectable()
export class TemporalWorkflowOutboxProcessor implements IOutboxEventProcessor {
	constructor(
		@Inject(DURABLE_EXECUTION_CLIENT)
		private readonly durableClient: IDurableExecutionClient,
		@Inject(WORKFLOW_FACTORY)
		private readonly workflowFactory: IWorkflowFactory
	) {}

	async process(event: OutboxEntity): Promise<void> {
		const workflowToken = this.workflowFactory.getWorkflowToken(event.eventType);
		if (!workflowToken) {
			throw new Error(`No workflow token found for event type: ${event.eventType}`);
		}

		let workflowId = '';
		if (event.eventType === 'CapturePaymentRequest') {
			workflowId = `payment-capture-${(event.payload as CapturePaymentRequestPayload).paymentId}`;
		} else if (event.eventType === 'UpdateSubscription') {
			workflowId = `subscription-update-${(event.payload as UpdateSubscriptionPayload).billId}`;
		} else {
			workflowId = `${event.eventType.toLowerCase()}-${event.id}`;
		}

		await this.durableClient.start(workflowToken, event.payload, {
			workflowId,
		});
	}
}

@Injectable()
export class KafkaEventOutboxProcessor implements IOutboxEventProcessor {
	constructor(
		@Inject(EVENT_BUS)
		private readonly eventBus: IEventBus
	) {}

	async process(event: OutboxEntity): Promise<void> {
		const topic = event.transport?.topic;
		if (!topic || typeof topic !== 'string') {
			throw new Error(
				`Kafka topic is not defined in transport metadata for event: ${event.id} (eventType: ${event.eventType})`
			);
		}
		const key = event.transport?.key;

		await this.eventBus.publish({
			topic,
			key: typeof key === 'string' ? key : undefined,
			value: event.payload,
			headers: {
				version: '1.0',
				createdAt: event.createdAt.toISOString(),
			},
		});
	}
}

@Injectable()
export class OutboxProcessorFactory {
	constructor(
		private readonly temporalProcessor: TemporalWorkflowOutboxProcessor,
		private readonly kafkaProcessor: KafkaEventOutboxProcessor
	) {}

	public getProcessor(tech: EOutboxProcessorTech): IOutboxEventProcessor {
		switch (tech) {
			case EOutboxProcessorTech.TEMPORAL_WORKFLOW:
				return this.temporalProcessor;
			case EOutboxProcessorTech.KAFKA_EVENT:
				return this.kafkaProcessor;
			default:
				throw new Error(`Unsupported outbox processor technology: ${tech}`);
		}
	}
}
