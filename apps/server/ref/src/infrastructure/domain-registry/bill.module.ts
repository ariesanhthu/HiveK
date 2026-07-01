import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { BillController } from '@/presentation/controllers/grpc/bill.controller';

import { BillCreateHandler, BillCalculateHandler, BillCancelHandler } from '@/application/commands';

import { BillGetListHandler, BillGetByIdHandler } from '@/application/queries';
import { BillGrpcMapper } from '@/presentation/mappers';
import { BillService } from '@/application/ser';

const COMMAND_HANDLERS = [BillCreateHandler, BillCalculateHandler, BillCancelHandler];

const QUERY_HANDLERS = [BillGetListHandler, BillGetByIdHandler];

@Module({
	imports: [CqrsModule, InfrastructureModule],
	controllers: [BillController],
	providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, BillService, BillGrpcMapper],
	exports: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, BillService],
})
export class BillModule {}
