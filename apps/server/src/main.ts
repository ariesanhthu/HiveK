import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/modules/app.module';
import { setupApplication, setupSwagger } from '@infrastructure/nest-config';
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
  Logger.log(`📖 Swagger admin docs available at: http://${host}:${port}/hivek/api/admin/docs`);
  Logger.log(`📖 Swagger client docs available at: http://${host}:${port}/hivek/api/client/docs`);
  Logger.log(`==========================================================`);
}
bootstrap();
