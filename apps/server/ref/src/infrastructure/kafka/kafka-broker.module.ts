import { Module } from '@nestjs/common';
import { SgodKafkaModule } from '@sgod-kafka/library/nestjs';
import { getPaymentKafkaLibOptions } from './kafka-lib.options';
import { KafkaEventBusAdapter } from './kafka-event-bus.adapter';
import { EVENT_BUS } from '@/core';

@Module({
	imports: [
		SgodKafkaModule.forRoot({
			...getPaymentKafkaLibOptions(),
			serviceName: 'payment-service',
			clientName: 'KAFKA_SERVICE',
		}),
	],
	providers: [
		KafkaEventBusAdapter,
		{
			provide: EVENT_BUS,
			useExisting: KafkaEventBusAdapter,
		},
	],
	exports: [SgodKafkaModule, EVENT_BUS, KafkaEventBusAdapter],
})
export class KafkaBrokerModule {}
