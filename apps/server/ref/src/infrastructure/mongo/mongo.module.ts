import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoBrownfieldModule } from '@sgod-mongodb/library/nestjs';
import {
	PaymentEventModel,
	PaymentEventSchema,
	PaymentModel,
	PaymentProviderModel,
	PaymentProviderSchema,
	PaymentSchema,
} from './schemas';
import {
	MongoAuditRepository,
	MongoPaymentRepository,
	MongoPaymentProviderRepository,
	MongoOutboxRepository,
} from './repositories';
import { PAYMENT_REPOSITORY, OUTBOX_REPOSITORY } from '@/core';
import { AuditRepository } from '@/core';
import { PAYMENT_PROVIDER_REPOSITORY } from '@/core';
import { PACKAGE_REPOSITORY } from '@/core';
import { SUBSCRIPTION_REPOSITORY, SUBSCRIPTION_HISTORY_REPOSITORY } from '@/core';
import { BILL_REPOSITORY } from '@/core';
import { WALLET_REPOSITORY, WALLET_TRANSACTION_REPOSITORY } from '@/core';
import { UNIT_OF_WORK } from '@/core/interfaces/repositories/unit-of-work.interface';
import { MongoUnitOfWork } from './unit-of-work';
import { MongoWalletRepository, MongoWalletTransactionRepository } from './repositories';
import {
	PackageModel,
	PackageSchema,
	SubscriptionModel,
	SubscriptionSchema,
	SubscriptionHistoryModel,
	SubscriptionHistorySchema,
	BillModel,
	BillSchema,
	WalletModel,
	WalletSchema,
	WalletTransactionModel,
	WalletTransactionSchema,
	OutboxEventModel,
	OutboxEventSchema,
} from './schemas';
import { PackageCacheModule, CachedPackageRepository } from '@/infrastructure/cache';
import { MongoPackageRepository } from './repositories/mongo-package.repository';
import {
	MongoSubscriptionRepository,
	MongoSubscriptionHistoryRepository,
	MongoBillRepository,
} from './repositories';

@Global()
@Module({
	imports: [
		PackageCacheModule,
		MongoBrownfieldModule.forRootAsync({
			mongoose: {
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: (config: ConfigService) => ({
					uri: config.getOrThrow<string>('MONGO_URI'),
					maxPoolSize: config.get<number>('MONGO_MAX_POOL_SIZE') ?? 20,
					serverSelectionTimeoutMS: 5000,
					retryWrites: true,
					w: 'majority' as const,
				}),
			},
			cls: { registerInterceptor: true },
			registerTransactionManager: true,
		}),
		MongooseModule.forFeature([
			{ name: PaymentModel.name, schema: PaymentSchema },
			{ name: PaymentProviderModel.name, schema: PaymentProviderSchema },
			{ name: PaymentEventModel.name, schema: PaymentEventSchema },
			{ name: PackageModel.name, schema: PackageSchema },
			{ name: SubscriptionModel.name, schema: SubscriptionSchema },
			{ name: SubscriptionHistoryModel.name, schema: SubscriptionHistorySchema },
			{ name: BillModel.name, schema: BillSchema },
			{ name: WalletModel.name, schema: WalletSchema },
			{ name: WalletTransactionModel.name, schema: WalletTransactionSchema },
			{ name: OutboxEventModel.name, schema: OutboxEventSchema },
		]),
	],
	providers: [
		{
			provide: PAYMENT_REPOSITORY,
			useClass: MongoPaymentRepository,
		},
		{
			provide: AuditRepository,
			useClass: MongoAuditRepository,
		},
		{
			provide: PAYMENT_PROVIDER_REPOSITORY,
			useClass: MongoPaymentProviderRepository,
		},
		{
			provide: UNIT_OF_WORK,
			useClass: MongoUnitOfWork,
		},
		{ provide: MongoPackageRepository, useClass: MongoPackageRepository },
		CachedPackageRepository,
		{ provide: PACKAGE_REPOSITORY, useExisting: CachedPackageRepository },
		{ provide: SUBSCRIPTION_REPOSITORY, useClass: MongoSubscriptionRepository },
		{ provide: SUBSCRIPTION_HISTORY_REPOSITORY, useClass: MongoSubscriptionHistoryRepository },
		{ provide: BILL_REPOSITORY, useClass: MongoBillRepository },
		{ provide: WALLET_REPOSITORY, useClass: MongoWalletRepository },
		{ provide: WALLET_TRANSACTION_REPOSITORY, useClass: MongoWalletTransactionRepository },
		{ provide: OUTBOX_REPOSITORY, useClass: MongoOutboxRepository },
	],
	exports: [
		PAYMENT_REPOSITORY,
		AuditRepository,
		PAYMENT_PROVIDER_REPOSITORY,
		UNIT_OF_WORK,
		PACKAGE_REPOSITORY,
		SUBSCRIPTION_REPOSITORY,
		SUBSCRIPTION_HISTORY_REPOSITORY,
		BILL_REPOSITORY,
		WALLET_REPOSITORY,
		WALLET_TRANSACTION_REPOSITORY,
		OUTBOX_REPOSITORY,
		PackageCacheModule,
	],
})
export class MongoModule {}
