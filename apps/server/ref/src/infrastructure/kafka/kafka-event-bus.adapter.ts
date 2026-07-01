import { Injectable, Logger } from '@nestjs/common';
import { SgodKafkaProducerService } from '@sgod-kafka/library/nestjs';
import { type IEventBus, type IEventMessage } from '@/core';

/** `IEventBus` qua `@sgod-kafka/library` — giữ flat DTO publish (`SubscriptionUpdatedEvent`). */
@Injectable()
export class KafkaEventBusAdapter implements IEventBus {
	private readonly logger = new Logger(KafkaEventBusAdapter.name);

	constructor(private readonly producer: SgodKafkaProducerService) {}

	async publish(event: IEventMessage): Promise<void> {
		if (!this.producer.isEnabled()) {
			this.logger.warn(`Kafka disabled — bỏ qua publish topic ${event.topic}`);
			return;
		}
		await this.producer.publish(event.topic, event.value, event.key);
	}

	async publishMany(events: IEventMessage[]): Promise<void> {
		for (const event of events) {
			await this.publish(event);
		}
	}
}
