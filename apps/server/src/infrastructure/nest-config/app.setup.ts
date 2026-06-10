import { INestApplication, Logger } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import { LoggingInterceptor, TransformInterceptor } from '@/presentation/middleware/interceptors';
import { HttpExceptionFilter } from '@/presentation/middleware/filters';
import { RabbitMQFactoryService } from '@infrastructure/rabbitmq';

export function setupApplication(app: INestApplication): void {
  // Apply Security Headers
  app.use((req, res, next) => {
    if (!req.path?.startsWith('/hivek/graphql')) {
      return helmet()(req, res, next);
    }
    return next();
  });


  // Apply CORS
  app.enableCors({
    origin: '*', // Adjust for production environments
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix for all routes
  app.setGlobalPrefix('hivek');

  // // Apply Global Pipes
  // app.useGlobalPipes(new ZodValidationPipe());

  // // Apply Global Interceptors
  // app.useGlobalInterceptors(
  //   new LoggingInterceptor(),
  //   new TransformInterceptor(),
  // );

  // // Apply Global Filters (single catch-all filter handles all exceptions)
  // app.useGlobalFilters(new HttpExceptionFilter());
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Setup RabbitMQ microservice consumer
 * Loads config from file via RabbitMQFactoryService and connects microservice
 * @param app - NestJS application instance
 * @param rabbitmqFactory - Configuration service for loading RabbitMQ config
 * @param maxRetries - Maximum number of retries (-1 = infinite)
 * @param initialDelayMs - Initial delay before first retry
 * @param maxDelayMs - Maximum delay between retries
 * @param factor - Exponential backoff multiplier
 */
export async function setupRabbitMQMicroservice(
  app: INestApplication,
  rabbitmqFactory: RabbitMQFactoryService,
  configPath: string,
  maxRetries: number = -1,
  initialDelayMs: number = 1000,
  maxDelayMs: number = 30000,
  factor: number = 2
): Promise<void> {
  const logger = new Logger('RabbitMQSetup');
  let retries = 0;
  let delayMs = initialDelayMs;

  while (maxRetries === -1 || retries < maxRetries) {
    try {
      logger.debug(`Attempting to connect RabbitMQ microservice (attempt ${retries + 1})...`);

      // Load consumer config from file
      const consumerConfig = rabbitmqFactory.readRMQConsumerConfig(
        configPath
      );

      // Convert consumer config to NestJS microservice options
      const microserviceOptions = rabbitmqFactory.toNestJSMicroserviceOptions(consumerConfig);

      app.connectMicroservice(microserviceOptions);
      await app.startAllMicroservices();
      logger.log(
        `✅ RabbitMQ microservice connected and ready to consume messages\n` +
        `   Queue: ${consumerConfig.queues[0]?.name}\n` +
        `   Exchange: ${consumerConfig.queues[0]?.bindings[0]?.exchange}`
      );
      return; // Success, exit retry loop
    } catch (error) {
      retries++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn(
        `⚠️ Failed to connect RabbitMQ microservice (attempt ${retries}): ${errorMessage}\n` +
        `   Retrying in ${delayMs}ms...`
      );

      await sleep(delayMs);
      delayMs = Math.min(delayMs * factor, maxDelayMs);
    }
  }

  logger.error(
    `❌ Failed to connect RabbitMQ microservice after ${retries} attempts.\n` +
    `   HTTP server is running, but message consumers are permanently unavailable.`
  );
}
