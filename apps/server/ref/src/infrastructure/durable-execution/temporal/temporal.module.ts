/**
 * Temporal Durable Execution Module
 *
 * Provides Temporal as the durable execution implementation.
 * Registers activities from application layer and provides IDurableExecutionClient.
 */

import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection, Client } from '@temporalio/client';

import { TemporalDurableExecutionClient, TEMPORAL_CLIENT_TOKEN } from './temporal-client.service';
import { TEMPORAL_CONFIG } from './config';
import { DURABLE_EXECUTION_CLIENT } from '@/shared/durable-execution';

// Import activity classes from activities file (not workflow barrel)
import {} from '@/application/workflows/activities';

import { InfrastructureModule } from '@/infrastructure/infrastructure.module';

const activityProviders = [];

@Global()
@Module({
	imports: [ConfigModule, InfrastructureModule],
	providers: [
		// Temporal Client
		{
			provide: TEMPORAL_CLIENT_TOKEN,
			useFactory: async (configService: ConfigService) => {
				const address =
					configService.get<string>('TEMPORAL_ADDRESS') || TEMPORAL_CONFIG.address;
				const connection = await Connection.connect({ address });
				return new Client({ connection });
			},
			inject: [ConfigService],
		},

		// Durable Execution Client (interface implementation)
		{
			provide: DURABLE_EXECUTION_CLIENT,
			useClass: TemporalDurableExecutionClient,
		},

		// Activity classes (for DI)
		...activityProviders,
	],
	exports: [DURABLE_EXECUTION_CLIENT, TEMPORAL_CLIENT_TOKEN, ...activityProviders],
})
export class TemporalDurableExecutionModule {}
