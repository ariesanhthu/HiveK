import { Module } from '@nestjs/common';
import { KafkaBrokerModule } from './kafka-broker.module';

/** Re-export `KafkaBrokerModule` (đã export `EVENT_BUS`). */
@Module({
	imports: [KafkaBrokerModule],
	exports: [KafkaBrokerModule],
})
export class KafkaModule {}
