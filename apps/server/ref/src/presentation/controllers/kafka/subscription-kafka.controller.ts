import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CommandBus } from '@nestjs/cqrs';
import { SubscriptionRejectCommand } from '@/application/commands/subscription-reject/subscription-reject.command';
import { type ILoggerService, LOGGER_SERVICE } from '@/core/interfaces';
import { tryParseKafkaEnvelope } from '@/infrastructure/kafka/utils/parse-kafka-envelope.util';

export interface SubscriptionSyncRejectedPayload {
	tenantId: string;
	invalidPermissions: string[];
	occurredOn: string;
	name: string;
	topic: string;
}

@Controller()
export class SubscriptionKafkaController {
	constructor(
		private readonly commandBus: CommandBus,
		@Inject(LOGGER_SERVICE)
		private readonly logger: ILoggerService
	) {
		this.logger.setContext(SubscriptionKafkaController.name);
	}

	@EventPattern('auth.subscription.sync-rejected')
	async handleSubscriptionSyncRejected(@Payload() raw: unknown) {
		const parsed = tryParseKafkaEnvelope<SubscriptionSyncRejectedPayload>(raw, {
			eventType: 'SubscriptionSyncRejectedEvent',
			topic: 'auth.subscription.sync-rejected',
		});

		if (!parsed) {
			this.logger.error('Invalid Kafka envelope — auth.subscription.sync-rejected');
			return;
		}

		const eventType = parsed.envelope.eventType;
		const payload = parsed.envelope.payload;

		this.logger.log(`Received ${eventType} for tenant: ${payload?.tenantId}`);

		if (eventType !== 'SubscriptionSyncRejectedEvent') {
			this.logger.warn(
				`Unknown eventType: ${eventType}. Expected SubscriptionSyncRejectedEvent`
			);
		}

		if (!payload) {
			this.logger.error('Received message with empty payload');
			return;
		}

		await this.commandBus.execute(
			new SubscriptionRejectCommand({
				enterpriseId: payload.tenantId,
				invalidPermissions: payload.invalidPermissions,
				occurredOn: payload.occurredOn,
				name: payload.name,
				topic: payload.topic,
			})
		);
	}
}
