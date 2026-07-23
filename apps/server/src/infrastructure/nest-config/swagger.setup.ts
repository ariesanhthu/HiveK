import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from '@/app.config';

export function setupSwagger(app: INestApplication, appConfig: AppConfig): void {
  const config = new DocumentBuilder()
    .setTitle(appConfig.getSwaggerTitle())
    .setDescription(appConfig.getSwaggerDescription())
    .setVersion(appConfig.getSwaggerVersion())
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .addSecurityRequirements('x-api-key')
    .build();

  const swaggerCustomOptions = {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationSorter: 'alpha',
    },
  };

  const fullDocument = SwaggerModule.createDocument(app, config);

  fullDocument.tags = fullDocument.tags?.filter(tag => tag.name !== '');
  for (const path in fullDocument.paths) {
    for (const method in fullDocument.paths[path]) {
      (fullDocument as any).paths[path][method].tags =
        (fullDocument as any).paths[path][method].tags?.filter((tag: string) => tag !== '');
    }
  }


  // ---- Separate paths ----
  const isAdminPath = (path: string) => path.includes(`/admin`);
  const isClientPath = (path: string) => path.includes(`/client`);
  const isSharedPath = (path: string) => !isAdminPath(path) && !isClientPath(path)
  const adminPaths = Object.fromEntries(
    Object.entries(fullDocument.paths).filter(([path]) => isAdminPath(path) || isSharedPath(path)),
  );

  const clientPaths = Object.fromEntries(
    Object.entries(fullDocument.paths).filter(([path]) =>
      isClientPath(path) || (isSharedPath(path))
    ),
  );

  const adminDocument = { ...fullDocument, paths: adminPaths };
  const clientDocument = { ...fullDocument, paths: clientPaths };

  // ---- Setup Swagger UI ----
  const globalPrefix = appConfig.getGlobalPrefix();
  SwaggerModule.setup(`${globalPrefix}/admin/docs`, app, adminDocument, { ...swaggerCustomOptions, jsonDocumentUrl: `${globalPrefix}/admin/docs/openapi-json` });
  SwaggerModule.setup(`${globalPrefix}/client/docs`, app, clientDocument, { ...swaggerCustomOptions, jsonDocumentUrl: `${globalPrefix}/client/docs/openapi-json` });
}

