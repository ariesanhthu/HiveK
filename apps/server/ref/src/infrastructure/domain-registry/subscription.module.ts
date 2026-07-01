import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InfrastructureModule } from '@/infrastructure/infrastructure.module';
import { SubscriptionController } from '@/presentation/controllers/grpc/subscription.controller';
import { SubscriptionKafkaController } from '@/presentation/controllers/kafka/subscription-kafka.controller';
import { SubscriptionGrpcMapper } from '@/presentation/mappers';

import {
	SubscriptionGetByEnterpriseHandler,
	SubscriptionGetByIdHandler,
	SubscriptionGetListHandler,
	SubscriptionGetListHistoryHandler,
	SubscriptionGetHistoryByIdHandler,
} from '@/application/queries';

import {
	ValidateUpdateActivity,
	RefundCreditActivity,
	DeductCreditActivity,
	UpdateSubscriptionActivity,
} from '@/application/workflows/activities';

import { SubscriptionRejectHandler } from '@/application/commands';
import { PackageLookup } from '@/application';

const COMMAND_HANDLERS = [SubscriptionRejectHandler];

const QUERY_HANDLERS = [
	SubscriptionGetByEnterpriseHandler,
	SubscriptionGetByIdHandler,
	SubscriptionGetListHandler,
	SubscriptionGetListHistoryHandler,
	SubscriptionGetHistoryByIdHandler,
];

const SAGAS = [];

const WORKFLOW_ACTIVITIES = [
	ValidateUpdateActivity,
	RefundCreditActivity,
	DeductCreditActivity,
	UpdateSubscriptionActivity,
];

@Module({
	imports: [CqrsModule, InfrastructureModule],
	controllers: [SubscriptionController, SubscriptionKafkaController],
	providers: [
		...COMMAND_HANDLERS,
		...QUERY_HANDLERS,
		...SAGAS,
		...WORKFLOW_ACTIVITIES,
		SubscriptionGrpcMapper,
		PackageLookup
	],
	exports: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...SAGAS, ...WORKFLOW_ACTIVITIES],
})
export class SubscriptionModule {}
