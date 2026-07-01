import { Module } from '@nestjs/common';
import { HealthGrpcController } from '@/presentation/controllers/grpc/health.grpc-controller';

@Module({
	controllers: [HealthGrpcController],
})
export class HealthModule {}
