import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { PaymentProviderGrpcController } from '@/presentation/controllers/grpc/payment-provider.controller';
import { PaymentProviderGrpcMapper } from '@/presentation/mappers';

import {
	PaymentProviderCreateHandler,
	PaymentProviderUpdateHandler,
	PaymentProviderDeleteHandler,
} from '@/application/commands';
import { PaymentProviderGetByIdHandler } from '@/application/queries';
import { PaymentProviderGetListHandler } from '@/application/queries';
import { GetPaymentProviderCredentialFieldsHandler } from '@/application/queries';

const COMMAND_HANDLERS = [
	PaymentProviderCreateHandler,
	PaymentProviderUpdateHandler,
	PaymentProviderDeleteHandler,
];

const QUERY_HANDLERS = [
	PaymentProviderGetByIdHandler,
	PaymentProviderGetListHandler,
	GetPaymentProviderCredentialFieldsHandler,
];

@Module({
	imports: [CqrsModule, InfrastructureModule],
	controllers: [PaymentProviderGrpcController],
	providers: [PaymentProviderGrpcMapper, ...COMMAND_HANDLERS, ...QUERY_HANDLERS],
	exports: [PaymentProviderGrpcMapper, ...COMMAND_HANDLERS, ...QUERY_HANDLERS],
})
export class PaymentProviderModule {}
