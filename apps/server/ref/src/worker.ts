/**
 * Temporal Worker
 *
 * Standalone script to run the Temporal worker.
 * Run with: yarn worker:temporal
 *
 * Features:
 * - Auto-discovery of activities via @Activity decorator
 * - Support for symbol tokens and string names
 * - NestJS DI integration
 * - Webpack bundling with path alias support
 */

import { NestFactory } from '@nestjs/core';
import { Worker, NativeConnection, bundleWorkflowCode } from '@temporalio/worker';
import { AppModule } from '@/app.module';
import {
	buildActivityMap,
	discoverActivities,
} from '@/infrastructure/durable-execution/temporal/registry/activity.registry';
import { TEMPORAL_CONFIG } from '@/infrastructure/durable-execution/temporal/config';
import { ModuleRef } from '@nestjs/core';

async function run() {
	console.log('Starting Temporal worker...');

	// Initialize NestJS Application Context to access services/providers
	const app = await NestFactory.createApplicationContext(AppModule, {
		logger: ['error', 'warn', 'log'],
	});

	const moduleRef = app.get(ModuleRef);

	// Discover activities with metadata
	const activityMetadata = discoverActivities(moduleRef);
	console.log('\n=== Discovered Activities ===');
	activityMetadata.forEach((meta) => {
		const tokenInfo = meta.token ? ` [Token: ${meta.token.description}]` : ' [Legacy]';
		console.log(`- ${meta.name}${tokenInfo}`);
	});
	console.log('');

	// Build activity map from DI container
	const activities = buildActivityMap(moduleRef);
	console.log(`Registered ${Object.keys(activities).length} activities for Temporal`);

	// Connect to Temporal Server
	const connection = await NativeConnection.connect({
		address: TEMPORAL_CONFIG.address,
	});

	// Bundle workflows with webpack alias support
	console.log('Bundling workflows...');
	const workflowBundle = await bundleWorkflowCode({
		workflowsPath:
			require.resolve('./infrastructure/durable-execution/temporal/registry/domain'),
		webpackConfigHook: (config) => {
			config.resolve = config.resolve || {};
			const existing = config.resolve.alias;
			const aliasObj =
				typeof existing === 'object' && existing !== null && !Array.isArray(existing)
					? existing
					: {};
			config.resolve.alias = {
				...aliasObj,
				'@': __dirname,
			};
			return config;
		},
	});

	// Create worker
	const worker = await Worker.create({
		connection,
		namespace: TEMPORAL_CONFIG.namespace,
		taskQueue: TEMPORAL_CONFIG.taskQueue,
		workflowBundle,
		activities,
	});

	console.log(`Temporal worker started on task queue: ${TEMPORAL_CONFIG.taskQueue}`);

	// Handle shutdown
	const shutdown = async () => {
		console.log('Shutting down worker...');
		worker.shutdown();
		await app.close();
		process.exit(0);
	};

	process.on('SIGINT', () => {
		void shutdown();
	});
	process.on('SIGTERM', () => {
		void shutdown();
	});

	// Run worker (blocks until shutdown)
	await worker.run();

	await app.close();
}

run().catch((err: unknown) => {
	console.error('Worker failed:', err);
	process.exit(1);
});
