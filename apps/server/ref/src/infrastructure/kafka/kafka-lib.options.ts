import type { KafkaEnvOverrides } from '@sgod-kafka/library/config';

/** Đọc env tại runtime (sau `load-env.ts`). */
export function getPaymentKafkaLibOptions(): KafkaEnvOverrides {
	return {
		serviceName: 'payment-service',
		clientId: process.env.KAFKA_CLIENT_ID || 'payment-service',
		groupId: process.env.KAFKA_GROUP_ID || 'payment-service-group',
	};
}
