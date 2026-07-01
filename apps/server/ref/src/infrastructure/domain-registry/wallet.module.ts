import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { WalletController } from '@/presentation/controllers/grpc/wallet.controller';
import { WalletGrpcMapper } from '@/presentation/mappers';

import {
	WalletGetByIdHandler,
	WalletGetByEnterpriseHandler,
	WalletGetListHandler,
	WalletGetListTransactionHandler,
	WalletTransactionGetByIdHandler,
} from '@/application/queries';

const QUERY_HANDLERS = [
	WalletGetByIdHandler,
	WalletGetByEnterpriseHandler,
	WalletGetListHandler,
	WalletGetListTransactionHandler,
	WalletTransactionGetByIdHandler,
];

@Module({
	imports: [CqrsModule, InfrastructureModule],
	controllers: [WalletController],
	providers: [...QUERY_HANDLERS, WalletGrpcMapper],
	exports: [...QUERY_HANDLERS],
})
export class WalletModule {}
