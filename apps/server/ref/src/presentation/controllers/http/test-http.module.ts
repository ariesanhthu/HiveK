import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { KafkaTestController } from './kafka-test.controller';

@Module({
	imports: [InfrastructureModule],
	controllers: [KafkaTestController],
})
export class TestHttpModule {}
