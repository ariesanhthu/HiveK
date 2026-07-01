import { Controller, Inject, Logger, Get } from '@nestjs/common';
import { EVENT_BUS } from '@/core';
import { type IEventBus } from '@/core';
import { getErrorMessage, getErrorStack } from '@/shared/utils/error.util';

@Controller('test-kafka')
export class KafkaTestController {
	private readonly logger = new Logger(KafkaTestController.name);

	constructor(@Inject(EVENT_BUS) private readonly kafkaService: IEventBus) {}

	@Get()
	async sendTestMessage() {
		const topic = 'payment.subscription.auth.updated';
		const message = {
			id: '507f1f77bcf86cd799439011',
			enterprise_id: '507f1f77bcf86cd799439023',
			permissions: ['auth:CreateRole', 'auth:UpdateRole', 'auth:DeleteRole', 'auth:GetRole'],
			quota: {
				max_users: 1000,
			},
			timestamp: new Date().toISOString(),
		};

		this.logger.log(`Sending test message to topic: ${topic}`);

		try {
			await this.kafkaService.publish({
				topic: topic,
				value: message,
				key: 'test-key',
			});

			return {
				success: true,
				message: 'Message sent to Kafka successfully',
				data: message,
			};
		} catch (error: unknown) {
			this.logger.error('Failed to send message to Kafka', getErrorStack(error));
			return {
				success: false,
				error: getErrorMessage(error),
			};
		}
	}
}
