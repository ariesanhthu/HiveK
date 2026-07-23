import { AppConfig } from '@/configs';
import { setupApplication, setupSwagger } from '@infrastructure/nest-config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './infrastructure/modules/app.module';

async function bootstrap() {
  const appConfig = new AppConfig();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await setupApplication(app, appConfig);
  setupSwagger(app, appConfig);

  const host = appConfig.getHost();
  const port = appConfig.getPort();
  const globalPrefix = appConfig.getGlobalPrefix();

  await app.listen(port, host);

  Logger.log(`==========================================================`);
  Logger.log(
    `🚀 Application is running on: http://${host}:${port}/${globalPrefix}/api`,
  );
  Logger.log(
    `📖 Swagger admin docs available at: http://${host}:${port}/${globalPrefix}/admin/docs`,
  );
  Logger.log(
    `📖 Swagger client docs available at: http://${host}:${port}/${globalPrefix}/client/docs`,
  );
  Logger.log(`==========================================================`);
}
bootstrap();
