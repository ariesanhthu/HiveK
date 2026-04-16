import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.setup';
import { setupApplication } from './config/app.setup';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  setupApplication(app);
  setupSwagger(app);

  // Start HTTP server first (prioritize HTTP availability)
  const host = process.env.HOST ?? '[IP_ADDRESS]';
  const port = process.env.PORT ?? 3000;
  await app.listen(port, host);

  Logger.log(`==========================================================`);
  Logger.log(`🚀 Application is running on: http://${host}:${port}/hivek/api`);
  Logger.log(`📖 Swagger docs available at: http://localhost:${port}/hivek/api/docs`);
  Logger.log(`==========================================================`);
}
bootstrap();
