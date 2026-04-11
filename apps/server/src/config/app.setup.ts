import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

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

  // Can easily append app.useGlobalPipes() or app.useGlobalInterceptors() here later
}
