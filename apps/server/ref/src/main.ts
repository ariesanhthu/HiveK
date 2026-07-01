import './load-env';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReflectionService } from '@grpc/reflection';
import { readFileSync } from 'fs';
import { ServerCredentials, type Server } from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';
import { buildNestKafkaMicroserviceOptions } from '@sgod-kafka/library/nestjs';
import { buildKafkaClientConfigFromEnv } from '@sgod-kafka/library/config';
import { getPaymentKafkaLibOptions } from './infrastructure/kafka/kafka-lib.options';

async function bootstrap() {
	const HOST = process.env.HOST ?? '0.0.0.0';
	const PORT = process.env.PORT || 50080;

	const certPath = join(process.cwd(), 'certs/grpc');
	const serverCert = readFileSync(join(certPath, 'payment/payment.crt'));
	const serverKey = readFileSync(join(certPath, 'payment/payment.key'));
	const _caCert = readFileSync(join(certPath, 'trust-store.pem'));

	const grpcCredentials = ServerCredentials.createSsl(
		_caCert,
		[
			{
				private_key: serverKey,
				cert_chain: serverCert,
			},
		],
		false
	);

	const app = await NestFactory.create(AppModule, {
		logger: ['error', 'warn', 'debug', 'log'],
	});

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.GRPC,
		options: {
			package: [
				'payment',
				'payment_provider',
				'audit',
				'grpc.health.v1',
				'package',
				'subscription',
				'bill',
				'wallet',
				'dev',
			],
			protoPath: [
				join(process.cwd(), 'proto/payment/repositories/payment.repository.proto'),
				join(process.cwd(), 'proto/payment/repositories/payment-provider.repository.proto'),
				join(process.cwd(), 'proto/payment/repositories/audit.repository.proto'),
				join(process.cwd(), 'proto/payment/repositories/package.repository.proto'),
				join(process.cwd(), 'proto/payment/repositories/subscription.repository.proto'),
				join(process.cwd(), 'proto/payment/repositories/bill.repository.proto'),
				join(process.cwd(), 'proto/payment/repositories/wallet.repository.proto'),
				join(process.cwd(), 'proto/payment/repositories/dev.repository.proto'),
				join(process.cwd(), 'proto/health.proto'),
			],
			url: `${HOST}:${parseInt(PORT as string)}`,
			credentials: grpcCredentials,
			onLoadPackageDefinition: (pkg: PackageDefinition, server: Server) => {
				new ReflectionService(pkg).addToServer(server);
			},
			loader: {
				includeDirs: [join(process.cwd(), 'proto')],
			},
		},
	});

	const paymentKafkaOptions = getPaymentKafkaLibOptions();
	const kafkaEnabled = buildKafkaClientConfigFromEnv(paymentKafkaOptions).enabled;

	if (kafkaEnabled) {
		app.connectMicroservice<MicroserviceOptions>(
			buildNestKafkaMicroserviceOptions(paymentKafkaOptions)
		);
	}

	await app.startAllMicroservices();
	await app.init();

	console.log(`🔒 gRPC server running with SSL/TLS (one-way) on ${HOST}:${PORT}`);
	if (kafkaEnabled) {
		console.log(
			`📡 Kafka consumer connected (group: ${paymentKafkaOptions.groupId ?? 'payment-service-group'})`
		);
	}
}
void bootstrap();
