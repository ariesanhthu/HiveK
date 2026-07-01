import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { credentials, InterceptingCall } from '@grpc/grpc-js';
import * as fs from 'fs';
import { ENTERPRISE_REPOSITORY } from '@/core';
import { USER_REPOSITORY } from '@/core';
import { AUTH_SERVICE } from '@/core';
import { GrpcEnterpriseRepository } from './grpc-enterprise.repository';
import { GrpcUserRepository } from './grpc-user.repository';
import { GrpcAuthService, AUTH_PACKAGE } from './grpc-auth.service';
import { MyRetryService } from '../services/retry/my-retry.service';
import { MyCircuitBreakerService } from '../services/circuit-breaker/my-circuit-breaker.service';
import { resolveGrpcClientUrl } from './resolve-grpc-client-url';

/**
 * Module for external gRPC client repositories.
 *
 * Registers gRPC clients:
 * - AUTH_PACKAGE: Auth service gRPC client
 *
 * Each client is configured with:
 * - Proto file path
 * - Service URL from environment
 * - gRPC transport layer with TLS credentials
 */
@Module({
	imports: [
		ConfigModule,
		ClientsModule.registerAsync([
			{
				name: AUTH_PACKAGE,
				inject: [ConfigService],
				useFactory: (config: ConfigService) => {
					const certPath = join(process.cwd(), 'certs/grpc/payment/payment.crt');
					const keyPath = join(process.cwd(), 'certs/grpc/payment/payment.key');
					// const certPath = join(
					// 	process.cwd(),
					// 	'certs/grpc/auth-service/auth-service.crt'
					// );
					// const keyPath = join(process.cwd(), 'certs/grpc/auth-service/auth-service.key');
					const _caCert = join(process.cwd(), 'certs/grpc/trust-store.pem');

					if (
						!fs.existsSync(certPath) ||
						!fs.existsSync(keyPath) ||
						!fs.existsSync(_caCert)
					) {
						throw new Error('Auth service certificate or key not found for gRPC TLS.');
					}

					const apiKey =
						config.get<string>('AUTH_API_KEY') ||
						'SmartGenerationofDigital_Sgod2025auth';

					const authGrpcUrl = resolveGrpcClientUrl(config.get<string>('AUTH_GRPC_URL'));

					return {
						transport: Transport.GRPC,
						options: {
							url: authGrpcUrl,
							package: 'permissions',
							protoPath: join(
								process.cwd(),
								'proto/external/auth/repositories/permissions.repository.proto'
							),
							credentials: credentials.createSsl(
								fs.readFileSync(_caCert),
								fs.readFileSync(keyPath),
								fs.readFileSync(certPath)
							),
							channelOptions: {
								interceptors: [
									(options, nextCall) => {
										return new InterceptingCall(nextCall(options), {
											start: (metadata, listener, next) => {
												if (!metadata.get('x-api-key').length) {
													metadata.add('x-api-key', apiKey);
												}
												next(metadata, listener);
											},
										});
									},
								],
							},
						},
					};
				},
			},
		]),
	],
	providers: [
		MyRetryService,
		MyCircuitBreakerService,
		{
			provide: ENTERPRISE_REPOSITORY,
			useClass: GrpcEnterpriseRepository,
		},
		{
			provide: USER_REPOSITORY,
			useClass: GrpcUserRepository,
		},
		{
			provide: AUTH_SERVICE,
			useClass: GrpcAuthService,
		},
	],
	exports: [ENTERPRISE_REPOSITORY, USER_REPOSITORY, AUTH_SERVICE],
})
export class GrpcClientsModule {}
