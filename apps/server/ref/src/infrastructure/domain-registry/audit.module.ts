import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { AuditController as AuditGrpcController } from '@/presentation/controllers/grpc/audit.controller';
import { AuditGrpcMapper } from '@/presentation/mappers';

import {
	PaymentEventGetByIdHandler,
	PaymentEventGetByPaymentIdHandler,
} from '@/application/queries';

const QUERY_HANDLERS = [PaymentEventGetByIdHandler, PaymentEventGetByPaymentIdHandler];

@Module({
	imports: [CqrsModule, InfrastructureModule],
	controllers: [AuditGrpcController],
	providers: [...QUERY_HANDLERS, AuditGrpcMapper],
	exports: [...QUERY_HANDLERS],
})
export class AuditModule {}
