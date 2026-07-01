import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import {
	PaymentModule,
	PaymentProviderModule,
	AuditModule,
	PackageModule,
	SubscriptionModule,
	BillModule,
	WalletModule,
} from './infrastructure/domain-registry';
import { GrpcLoggingInterceptor } from './presentation/middlewares/interceptors';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HealthModule } from './infrastructure/health/health.module';
import { GrpcExceptionFilter } from './presentation/middlewares/filters';
import { TemporalDurableExecutionModule } from './infrastructure/durable-execution';
import { CaslGrpcExceptionFilter, CaslModule } from '@sgod-casl/library';
import {
	paymentCaslModuleOptions,
	PaymentGrpcCaslGuard,
	PaymentGrpcMetadataExtractGuard,
} from './shared/permissions/casl';
import { TestHttpModule } from './presentation/controllers/http/test-http.module';
import { DevModule } from './infrastructure/domain-registry/dev.module';

@Module({
	imports: [
		CaslModule.forRoot(paymentCaslModuleOptions),
		InfrastructureModule,
		TemporalDurableExecutionModule,
		PaymentModule,
		PaymentProviderModule,
		AuditModule,
		PackageModule,
		BillModule,
		WalletModule,
		SubscriptionModule,
		HealthModule,
		TestHttpModule,
		DevModule,
	],
	controllers: [],
	providers: [
		PaymentGrpcMetadataExtractGuard,
		PaymentGrpcCaslGuard,
		{
			provide: APP_FILTER,
			useClass: CaslGrpcExceptionFilter,
		},
		{
			provide: APP_FILTER,
			useClass: GrpcExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: GrpcLoggingInterceptor,
		},
	],
})
export class AppModule {}
