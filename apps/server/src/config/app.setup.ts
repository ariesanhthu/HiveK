import { INestApplication } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import { LoggingInterceptor } from '@/presentation/middleware/logging.interceptor';
import { HttpExceptionFilter } from '@/presentation/middleware/http-exception.filter';

export function setupApplication(app: INestApplication): void {
  // Apply Security Headers
  app.use(helmet());

  // Apply CORS
  app.enableCors({
    origin: '*', // Adjust for production environments
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Prefix for all routes
  app.setGlobalPrefix('hivek/api');

  // Apply Global Pipes
  app.useGlobalPipes(new ZodValidationPipe());

  // Apply Global Interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Apply Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());
}
