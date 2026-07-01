import { Global, Module } from '@nestjs/common';
import { MongoModule } from './mongo/mongo.module';
import { ConfigModule } from '@nestjs/config';
import { PaymentProviderDiscoveryModule } from './services/payment-providers';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedInfrastructureModule } from './shared/shared-infrastructure.module';
import { SeedingService } from './services/seeding-data/seeding.service';
import { GrpcClientsModule } from './grpc-clients';
import { WORKFLOW_FACTORY } from '@/core';
import {
	CommonValidationService,
	PackageLookup,
	BillLookup,
	SubscriptionLookup,
	ExternalLookup,
	PlanChangeResolverService,
	WorkflowFactory,
} from '@/application/services';
import { KafkaModule } from './kafka/kafka.module';
import { OutboxPollerService } from './services/outbox/outbox-poller.service';
import { OutboxEventTechMapper } from './services/outbox/outbox-tech.mapper';
import {
	OutboxProcessorFactory,
	TemporalWorkflowOutboxProcessor,
	KafkaEventOutboxProcessor,
} from './services/outbox/outbox-processor.factory';
import { PackageCacheModule } from './cache';

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: `.env`,
		}),
		MongoModule,
		PaymentProviderDiscoveryModule,
		CqrsModule,
		SharedInfrastructureModule,
		GrpcClientsModule,
		KafkaModule,
		PackageCacheModule,
	],
	providers: [
		SeedingService,
		PackageLookup,
		BillLookup,
		SubscriptionLookup,
		ExternalLookup,
		CommonValidationService,
		PlanChangeResolverService,
		{
			provide: WORKFLOW_FACTORY,
			useClass: WorkflowFactory,
		},
		OutboxEventTechMapper,
		TemporalWorkflowOutboxProcessor,
		KafkaEventOutboxProcessor,
		OutboxProcessorFactory,
		OutboxPollerService,
	],
	exports: [
		PaymentProviderDiscoveryModule,
		// MongoModule,
		SharedInfrastructureModule,
		GrpcClientsModule,
		PackageLookup,
		BillLookup,
		SubscriptionLookup,
		ExternalLookup,
		CommonValidationService,
		PlanChangeResolverService,
		KafkaModule,
		PackageCacheModule,
		WORKFLOW_FACTORY,
		OutboxPollerService,
	],
})
export class InfrastructureModule {}
